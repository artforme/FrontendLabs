const DropZone = () => {
  return (
    <div className="drop-zone">
      <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>Перетащите ZIP-архив сюда</p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ animation: 'progressAnimation 2s infinite alternate' }}></div>
      </div>
    </div>
  );
};

export default DropZone;