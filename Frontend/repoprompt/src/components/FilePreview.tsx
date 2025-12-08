import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { mockCode } from '../data/mockFileContent';

const FilePreview = () => {
  return (
    <div style={{ overflowY: 'auto', maxHeight: '24rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>File Preview</h3>
      <SyntaxHighlighter language="typescript" style={oneDark}>
        {mockCode}
      </SyntaxHighlighter>
    </div>
  );
};

export default FilePreview;