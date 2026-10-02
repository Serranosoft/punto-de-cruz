import { Redirect } from 'expo-router';

// Keep old links working without retaining the general unlock flow.
export default function LegacyBooksLink() {
    return <Redirect href="/pattern-books" />;
}
