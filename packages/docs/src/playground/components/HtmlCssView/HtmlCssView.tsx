import './HtmlCssView.css';

/** Injects compiled CSS into the HTML document and returns full document for iframe srcdoc. */
function injectCssIntoHtml(html: string, css: string): string {
  const styleTag = `<style>${css}</style>`;
  const headClose = html.indexOf('</head>');
  if (headClose !== -1) {
    return html.slice(0, headClose) + styleTag + html.slice(headClose);
  }
  return styleTag + html;
}

export interface HtmlCssViewProps {
  html: string;
  css: string;
}

export default function HtmlCssView({ html, css }: HtmlCssViewProps) {
  const doc = injectCssIntoHtml(html, css);
  return (
    <div className="surimi-playground__view">
      <div className="surimi-playground__view-header">
        <h3>Preview</h3>
      </div>
      <div className="surimi-playground__view-content">
        <iframe className="surimi-playground__view-iframe" title="Preview" srcDoc={doc} sandbox="allow-same-origin" />
      </div>
    </div>
  );
}
