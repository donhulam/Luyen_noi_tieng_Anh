/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useState } from 'react';
import { FunctionCall } from '../lib/state';
import Modal from './Modal';
import { FunctionResponseScheduling } from '@google/genai';

type ToolEditorModalProps = {
  tool: FunctionCall;
  onClose: () => void;
  onSave: (updatedTool: FunctionCall) => void;
};

export default function ToolEditorModal({
  tool,
  onClose,
  onSave,
}: ToolEditorModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parametersStr, setParametersStr] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState<FunctionResponseScheduling>(
    FunctionResponseScheduling.INTERRUPT,
  );

  useEffect(() => {
    if (tool) {
      setName(tool.name);
      setDescription(tool.description || '');
      setParametersStr(JSON.stringify(tool.parameters || {}, null, 2));
      setScheduling(tool.scheduling || FunctionResponseScheduling.INTERRUPT);
      setJsonError(null);
    }
  }, [tool]);

  const handleSave = () => {
    let parsedParameters;
    try {
      parsedParameters = JSON.parse(parametersStr);
      setJsonError(null);
    } catch (error) {
      setJsonError('Định dạng JSON không hợp lệ cho các tham số.');
      return;
    }

    onSave({
      ...tool,
      name,
      description,
      parameters: parsedParameters,
      scheduling,
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="tool-editor-modal">
        <h2>Chỉnh sửa Kỹ năng Gia sư</h2>
        <div className="form-field">
          <label htmlFor="tool-name">Tên</label>
          <input
            id="tool-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="tool-description">Mô tả</label>
          <textarea
            id="tool-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="form-field">
          <label htmlFor="tool-scheduling">Hành vi Lên lịch</label>
          <select
            id="tool-scheduling"
            value={scheduling}
            onChange={e =>
              setScheduling(e.target.value as FunctionResponseScheduling)
            }
          >
            <option value={FunctionResponseScheduling.INTERRUPT}>
              Ngắt quãng
            </option>
            <option value={FunctionResponseScheduling.WHEN_IDLE}>
              Khi rảnh rỗi
            </option>
            <option value={FunctionResponseScheduling.SILENT}>Im lặng</option>
          </select>
          <p className="scheduling-description">
            Xác định khi nào phản hồi của mô hình được nói ra. 'Ngắt quãng' sẽ nói ngay lập tức.
          </p>
        </div>
        <div className="form-field">
          <label htmlFor="tool-parameters">Tham số (Lược đồ JSON)</label>
          <textarea
            id="tool-parameters"
            className="json-editor"
            value={parametersStr}
            onChange={e => setParametersStr(e.target.value)}
          />
          {jsonError && <p className="json-error">{jsonError}</p>}
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-button">
            Hủy
          </button>
          <button onClick={handleSave} className="save-button">
            Lưu
          </button>
        </div>
      </div>
    </Modal>
  );
}