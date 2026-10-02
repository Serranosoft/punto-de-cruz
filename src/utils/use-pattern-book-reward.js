import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AdEventType, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { AdsContext } from './AdsContext';
import { rewardedBookId } from './constants';
import { grantBookAccess } from './pattern-book-access';
import { createBookRewardSession } from './pattern-book-reward-session';

export function usePatternBookReward(book, enabled) {
    const { adsLoaded, adRequestOptions, setShowOpenAd, onRewardedAdOpened, onRewardedAdClosed } = useContext(AdsContext);
    const [phase, setPhase] = useState('loading');
    const [attempt, setAttempt] = useState(0);
    const [sessionActive, setSessionActive] = useState(false);
    const current = useRef(null);
    const bookRef = useRef(book);
    bookRef.current = book;
    const identity = book?.importId || book?.id;
    const options = JSON.stringify(adRequestOptions || {});
    const shouldCreateAd = enabled || sessionActive;

    useEffect(() => {
        if (!shouldCreateAd || !identity || !adsLoaded || !rewardedBookId) return;
        setPhase('loading');
        const target = bookRef.current;
        const session = createBookRewardSession({
            grantAccess: () => grantBookAccess(target),
            onChange: next => {
                setPhase(next);
                if (next === 'adError') setSessionActive(false);
            },
            onOpened: () => {
                setShowOpenAd?.(false);
                onRewardedAdOpened?.();
            },
            onClosed: () => {
                onRewardedAdClosed?.();
                setShowOpenAd?.(true);
            },
        });
        let unsubscribe;
        let timer;
        try {
            const ad = RewardedAd.createForAdRequest(rewardedBookId, JSON.parse(options));
            current.current = { ad, session };
            timer = setTimeout(() => session.failed(), 30000);
            unsubscribe = ad.addAdEventsListener(({ type }) => {
                if (type === RewardedAdEventType.LOADED || type === AdEventType.ERROR) clearTimeout(timer);
                switch (type) {
                    case RewardedAdEventType.LOADED: session.loaded(); break;
                    case AdEventType.OPENED: session.opened(); break;
                    case RewardedAdEventType.EARNED_REWARD: session.rewarded(); break;
                    case AdEventType.CLOSED: session.closed(); setSessionActive(false); break;
                    case AdEventType.ERROR: session.failed(); setSessionActive(false); break;
                }
            });
            ad.load();
        } catch {
            session.failed();
        }
        return () => {
            clearTimeout(timer);
            unsubscribe?.();
            session.dispose();
            current.current = null;
        };
    }, [shouldCreateAd, identity, adsLoaded, options, attempt, setShowOpenAd, onRewardedAdOpened, onRewardedAdClosed]);

    const unlock = useCallback(() => {
        if (!adsLoaded || !rewardedBookId) return;
        if (phase === 'ready' && current.current) {
            setSessionActive(true);
            setShowOpenAd?.(false);
            current.current.session.show(current.current.ad);
        } else if (['adError', 'noReward', 'saveError'].includes(phase)) {
            setAttempt(value => value + 1);
        }
    }, [adsLoaded, phase, setShowOpenAd]);

    return { phase: adsLoaded && rewardedBookId ? phase : 'adError', unlock };
}
