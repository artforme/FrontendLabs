import { useEffect, useState } from 'react';
import { Folder, File } from 'lucide-react';
import rawMockTree from '../data/mockTree.json';

type Node = {
  name: string;
  type: 'folder' | 'file';
  children?: Node[];
};

const TreeNode = ({ node }: { node: Node }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <li className={`fade-in ${isVisible ? '' : 'opacity-0 translate-y-2'}`} style={{ listStyle: 'none', display: 'flex', alignItems: 'center', padding: '0.25rem 0' }}>
      {node.type === 'folder' ? <Folder size={16} style={{ color: '#3b82f6', marginRight: '0.5rem' }} /> : <File size={16} style={{ color: '#22c55e', marginRight: '0.5rem' }} />}
      {node.name}
      <input type="checkbox" style={{ marginLeft: 'auto' }} />
      {node.children && (
        <ul style={{ marginLeft: '1.5rem', padding: 0 }}>
          {node.children.map((child, i) => <TreeNode key={i} node={child} />)}
        </ul>
      )}
    </li>
  );
};

const FileTree = () => {
  const mockTree: Node = rawMockTree as unknown as Node;

  return (
    <div style={{ overflowY: 'auto', maxHeight: '24rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>File Tree</h3>
      <ul style={{ padding: 0 }}>
        <TreeNode node={mockTree} />
      </ul>
    </div>
  );
};

export default FileTree;