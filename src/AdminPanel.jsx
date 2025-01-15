import React, { useState } from 'react';
    import './AdminPanel.css';

    function AdminPanel({ participants, setSelectedWinnerIds, onLogout }) {
      const [selectedNumbers, setSelectedNumbers] = useState('');

      const handleSelectWinners = () => {
        const ids = selectedNumbers
          .split(',')
          .map(Number)
          .filter(id => !isNaN(id) && id > 0 && id <= participants.length);
        setSelectedWinnerIds(ids);
      };

      return (
        <div className="admin-panel">
          <h2>لوحة التحكم</h2>
          <button className="logout-button" onClick={onLogout}>
            تسجيل الخروج
          </button>
          <div className="controls">
            <div className="number-selector">
              <label>اختيار الأرقام (مفصولة بفاصلة):</label>
              <input
                type="text"
                placeholder="أدخل الأرقام"
                value={selectedNumbers}
                onChange={(e) => setSelectedNumbers(e.target.value)}
              />
            </div>
            <button className="select-winners-button" onClick={handleSelectWinners}>
              تحديد الفائزين
            </button>
          </div>
        </div>
      );
    }

    export default AdminPanel;
