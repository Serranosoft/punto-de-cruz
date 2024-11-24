
export default function ConvertStitchPatternWebView() {
    return <WebView
        source={{ uri: 'https://conversor-patron-de-cruz-5v2dw6rru-mscholzs-projects.vercel.app/' }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
    />

}