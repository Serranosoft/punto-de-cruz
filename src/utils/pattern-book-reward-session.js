// Each session consumes at most one native EARNED_REWARD event. Closing or
// successfully showing an ad alone never grants access.
export function createBookRewardSession({ grantAccess, onChange, onOpened, onClosed }) {
    let phase = 'loading';
    let attempted = false;
    let earned = false;
    let disposed = false;
    const update = next => {
        phase = next;
        if (!disposed) onChange(next);
    };
    const closeOverlay = () => { if (!disposed) onClosed(); };
    return {
        loaded() { if (phase === 'loading') update('ready'); },
        async show(ad) {
            if (disposed || phase !== 'ready') return;
            attempted = true;
            update('showing');
            try {
                await ad.show();
            } catch {
                if (!earned) {
                    attempted = false;
                    closeOverlay();
                    update('adError');
                }
            }
        },
        opened() { if (!disposed && attempted) onOpened(); },
        async rewarded() {
            if (disposed || !attempted || earned) return;
            earned = true;
            update('saving');
            try {
                await grantAccess();
                update('unlocked');
            } catch {
                update('saveError');
            }
        },
        closed() {
            closeOverlay();
            if (attempted && !earned) update('noReward');
            attempted = false;
        },
        failed() {
            closeOverlay();
            if (!earned) {
                attempted = false;
                update('adError');
            }
        },
        dispose() { closeOverlay(); disposed = true; },
    };
}
