import { useEffect, useState } from 'react';

async function fileToBase64(f: File): Promise<string> {
  const buf = await f.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function DropPaste() {
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      // Skip if pasting into editable
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const items = [...e.clipboardData.items];
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            await uploadFile(file);
          }
        }
      }
    };

    const onDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
        setHovering(true);
      }
    };
    const onDragLeave = (e: DragEvent) => {
      if ((e.relatedTarget as Node | null) === null) setHovering(false);
    };
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
      }
    };
    const onDrop = async (e: DragEvent) => {
      setHovering(false);
      if (!e.dataTransfer) return;
      const files = [...e.dataTransfer.files];
      if (files.length === 0) return;
      e.preventDefault();
      for (const file of files) await uploadFile(file);
    };

    window.addEventListener('paste', onPaste);
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('paste', onPaste);
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  if (!hovering) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 300,
      border: '3px dashed #5EEAD4',
      background: 'rgba(94,234,212,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#5EEAD4',
      fontSize: 18,
      fontFamily: 'JetBrains Mono, monospace'
    }}>
      drop file to attach as artifact
    </div>
  );
}

async function uploadFile(file: File): Promise<void> {
  const dataBase64 = await fileToBase64(file);
  await window.api.createAttachmentArtifact({
    dataBase64,
    mime: file.type || 'application/octet-stream',
    filename: file.name
  });
}
