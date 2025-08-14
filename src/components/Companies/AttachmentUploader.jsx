// src/components/AttachmentUploader.jsx
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import axios from 'axios';

const DEFAULT_ALLOWED = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',      // .xlsx
  'application/zip'
];

function toKB(n) { return n ? Math.round(n / 1024) : 0; }
function buildMarkdown(file) {
  const name = file.originalName || file.name || 'file';
  const url  = file.url || file.path || '';
  const ct   = file.contentType || file.type || '';
  const isImage = /^image\//.test(ct);
  return isImage ? `\n![${name}](${url})\n` : `\n[${name}](${url})\n`;
}

const AttachmentUploader = forwardRef(function AttachmentUploader(
  {
    value = [],                 // 첨부 목록 (부모가 관리)
    onChange,                   // 첨부 목록 변경 콜백
    onInsertMarkdown,           // 마크다운을 부모 텍스트 영역 커서 위치에 삽입하는 함수
    uploadUrl = '/api/uploads', // 업로드 API
    maxSizeMB = 20,
    allowedTypes = DEFAULT_ALLOWED,
    autoInsertSingle = true,
    buttonLabel = '📎 파일 첨부',
    className
  },
  ref
) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);

  const validateFiles = (files) => {
    const overs = [];
    const invalid = [];
    const valid = [];
    for (const f of files) {
      if (f.size > maxSizeMB * 1024 * 1024) overs.push(f);
      else if (!allowedTypes.includes(f.type)) invalid.push(f);
      else valid.push(f);
    }
    return { valid, overs, invalid };
  };

  const doUpload = async (files, { autoInsert = autoInsertSingle } = {}) => {
    if (!files?.length) return;

    const { valid, overs, invalid } = validateFiles(files);
    if (overs.length || invalid.length) {
      const msg = [
        overs.length   ? `용량 초과(${maxSizeMB}MB): ${overs.map(f=>f.name).join(', ')}` : '',
        invalid.length ? `허용되지 않는 형식: ${invalid.map(f=>f.name).join(', ')}`     : ''
      ].filter(Boolean).join('\n');
      alert(msg);
    }
    if (!valid.length) return;

    const fd = new FormData();
    valid.forEach(f => fd.append('files', f));
    
    setUploading(true);
    setProgress(0);
    try {
      const res = await axios.post(uploadUrl, fd, {
        withCredentials: true,
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round(e.loaded * 100 / e.total));
        }
      });

      const uploaded = Array.isArray(res.data) ? res.data : (res.data?.files || []);
      const next = [...uploaded, ...value];
      onChange?.(next);

      if (autoInsert && uploaded.length === 1 && onInsertMarkdown) {
        onInsertMarkdown(buildMarkdown(uploaded[0]));
      }
    } catch (e) {
      console.error(e);
      alert(`업로드 실패: ${e?.response?.data?.message || e.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onPick = (e) => {
    const files = Array.from(e.target.files || []);
    doUpload(files);
    e.target.value = ''; // 같은 파일 재선택 허용
  };

  const removeItem = (target) => {
    onChange?.(value.filter(v => v !== target));
  };

  // 부모에서 붙여넣기/드롭으로 파일을 넘길 수 있게 메서드 노출
  useImperativeHandle(ref, () => ({
    uploadFromExternal: (files, opts) => doUpload(files, opts),
    openPicker: () => fileInputRef.current?.click()
  }));

  return (
    <div className={className} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="파일 첨부(문서)"
        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
      >
        {buttonLabel}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        style={{ display: 'none' }}
        onChange={onPick}
      />

      {uploading && <span style={{ fontSize: 12 }}>업로드 중... {progress}%</span>}

      {/* 첨부 목록 */}
      {value?.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', width: '100%', display: 'grid', gap: 8 }}>
          {value.map((f, idx) => {
            const isImage = /^image\//.test(f.contentType || f.type || '');
            const key = (f.id ?? f.url ?? f.name ?? idx) + ':' + idx;
            return (
              <li key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isImage ? (
                  <img src={f.url} alt={f.originalName || f.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 4, border: '1px solid #eee', display: 'grid', placeItems: 'center' }}>📄</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.originalName || f.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>{toKB(f.size)} KB</div>
                </div>
                <button type="button" onClick={() => onInsertMarkdown?.(buildMarkdown(f))} style={{ padding: '6px 10px' }}>
                  본문에 삽입
                </button>
                <button type="button" onClick={() => removeItem(f)} style={{ padding: '6px 10px' }}>
                  목록에서 제거
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

export default AttachmentUploader;
