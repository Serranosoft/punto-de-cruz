import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useContext } from "react";
import { LangContext } from "../../src/utils/LangContext";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const { language } = useContext(LangContext);
    const insets = useSafeAreaInsets();
    
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#d35400',
                tabBarInactiveTintColor: '#8e8e93',
                tabBarStyle: [
                    styles.tabBar,
                    { 
                        height: Platform.OS === 'ios' ? 60 + insets.bottom : 70,
                        paddingBottom: Platform.OS === 'ios' ? (insets.bottom > 0 ? insets.bottom : 10) : 12
                    }
                ],
                tabBarLabelStyle: styles.tabBarLabel,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: language.t('_homeTitle'),
                    tabBarLabel: language.t('_homeTitle'),
                    tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: language.t('_homeExplore'),
                    tabBarLabel: language.t('_homeExplore'),
                    tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tools"
                options={{
                    title: language.t('_toolsTitle'),
                    tabBarLabel: language.t('_toolsTitle'),
                    tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "construct" : "construct-outline"} size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="stash"
                options={{
                    title: language.t('_stashTitle'),
                    tabBarLabel: language.t('_stashTitle'),
                    tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "archive" : "archive-outline"} size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: language.t('_profileTitle'),
                    tabBarLabel: language.t('_profileTitle'),
                    tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f1f1',
        paddingTop: 10,
        elevation: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabBarLabel: {
        fontFamily: "poppins-medium",
        fontSize: 10,
    }
});
