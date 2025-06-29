import Editor from '@monaco-editor/react';
import PropTypes from 'prop-types';

const CodeEditor = ({ language, code, onChange }) => {
  // Monaco's onChange can return undefined, so handle that
  const handleChange = (value) => {
    if (typeof onChange === 'function') {
      onChange(value || '');
    }
  };

  return (
    <div style={{ height: '600px', position: 'relative', overflow: 'visible' }}>
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleChange}
        theme="vs-dark"
        loading={<div style={{padding: '2rem', textAlign: 'center'}}>Loading editor...</div>}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 6,
          padding: { top: 8, bottom: 40 },
        }}
        onValidate={markers => {
          // You can handle syntax errors here if needed
          // markers is an array of error/warning objects
        }}
        onError={err => (
          <div style={{color: 'red', padding: '1rem'}}>Editor failed to load: {err.message}</div>
        )}
      />
    </div>
  );
};

CodeEditor.propTypes = {
  language: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CodeEditor; 