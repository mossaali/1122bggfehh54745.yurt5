import React, { useState, useRef, useEffect, useMemo } from 'react';
    import Confetti from 'react-confetti';
    import { ClipLoader } from 'react-spinners';
    import useSound from 'use-sound';
    import { read, utils } from 'xlsx';
    import celebrationSound from './assets/celebration.mp3';
    import spinSound from './assets/spin.mp3';
    import AdminPanel from './AdminPanel';
    import './App.css';

    function App() {
      const [participants, setParticipants] = useState([]);
      const [winners, setWinners] = useState([]);
      const [isSpinning, setIsSpinning] = useState(false);
      const [newParticipant, setNewParticipant] = useState('');
      const [showAdminPanel, setShowAdminPanel] = useState(false);
      const [showWinners, setShowWinners] = useState(false);
      const [degrees, setDegrees] = useState(0);
      const [selectedWinnerIds, setSelectedWinnerIds] = useState([]);
      const [numberOfWinners, setNumberOfWinners] = useState(1);
      const wheelRef = useRef(null);
      const [playCelebration] = useSound(celebrationSound);
      const [playSpin] = useSound(spinSound);

      // Check URL for admin login
      useEffect(() => {
        const path = window.location.pathname;
        if (path === '/Qsi87adminlofgin87') {
          setShowAdminPanel(true);
        }
      }, []);

      // Generate fixed colors for the wheel
      const wheelColors = useMemo(() => {
        return participants.map(() => `#${Math.floor(Math.random()*16777215).toString(16)}`);
      }, [participants.length]);

      const addParticipant = (name) => {
        if (!name.trim()) return;
        const newParticipant = {
          id: participants.length + 1,
          name: name
        };
        setParticipants([...participants, newParticipant]);
        setNewParticipant('');
      };

      const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = utils.sheet_to_json(worksheet, { header: 1 });
          const names = json
            .flat()
            .filter((cell) => typeof cell === 'string' && cell.trim() !== '');

          const newParticipants = names.map((name, index) => ({
            id: participants.length + index + 1,
            name: name
          }));
          setParticipants(prev => [...prev, ...newParticipants]);
        };
        reader.readAsArrayBuffer(file);
      };

      const handleSpin = () => {
        if (participants.length === 0) return;
        setIsSpinning(true);
        setShowWinners(false);
        playSpin();

        let winnerIds = [];
        if (selectedWinnerIds.length > 0) {
          winnerIds = selectedWinnerIds;
        } else {
          const availableParticipants = participants.filter(p => !winners.includes(p));
          const shuffledParticipants = [...availableParticipants].sort(() => 0.5 - Math.random());
          winnerIds = shuffledParticipants.slice(0, numberOfWinners).map(p => p.id);
        }

        const targetDegree = 360 * 5 + (360 / participants.length) * winnerIds[0];

        let currentDegree = degrees % 360;
        const interval = setInterval(() => {
          currentDegree += 10;
          setDegrees(currentDegree);
          if (currentDegree >= targetDegree) {
            clearInterval(interval);
            setIsSpinning(false);
            const newWinners = participants.filter(p => winnerIds.includes(p.id));
            setWinners(newWinners);
            setShowWinners(true);
            playCelebration();
            setSelectedWinnerIds([]);
          }
        }, 20);
      };

      useEffect(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${degrees}deg)`;
        }
      }, [degrees]);

      return (
        <div className="app">
          {winners.length > 0 && <Confetti />}
          <h1>نظام إدارة المشاركين</h1>

          {showAdminPanel && (
            <AdminPanel
              participants={participants}
              setSelectedWinnerIds={setSelectedWinnerIds}
              onLogout={() => {
                setShowAdminPanel(false);
                window.history.pushState({}, '', '/'); // Reset URL
              }}
            />
          )}

          <div className="add-participant">
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder="اسم المشارك"
            />
            <button onClick={() => addParticipant(newParticipant)}>
              إضافة مشارك
            </button>
            <div className="file-upload">
              <label htmlFor="excel-upload" className="upload-label">
                استيراد من Excel
              </label>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="wheel-container">
            <div 
              ref={wheelRef}
              className={`wheel ${isSpinning ? 'spinning' : ''}`}
              style={{ 
                background: `conic-gradient(
                  ${participants.map((p, i) => 
                    `${wheelColors[i]} ${i * (360/participants.length)}deg ${(i+1) * (360/participants.length)}deg`
                  ).join(', ')}
                )`
              }}
            >
              {isSpinning && <ClipLoader color="#ffffff" size={50} />}
            </div>
            <div className="wheel-controls">
              <div className="number-of-winners">
                <label>عدد الفائزين:</label>
                <input
                  type="number"
                  min="1"
                  max={participants.length}
                  value={numberOfWinners}
                  onChange={(e) => setNumberOfWinners(Number(e.target.value))}
                />
              </div>
              <button onClick={handleSpin} disabled={isSpinning || participants.length === 0}>
                {isSpinning ? 'جاري الدوران...' : 'اختيار الفائزين'}
              </button>
            </div>
          </div>

          {showWinners && winners.length > 0 && (
            <div className="winner-overlay">
              <div className="winner-card">
                <h2>مبروك للفائزين!</h2>
                <ul>
                  {winners.map((winner, index) => (
                    <li key={winner.id}>
                      <span className="winner-id">{winner.id}</span>
                      <span className="winner-text">{winner.name}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowWinners(false)}>إغلاق</button>
              </div>
            </div>
          )}

          <div className="participants-list">
            <h2>قائمة المشاركين</h2>
            <ul>
              {participants.map(p => (
                <li key={p.id}>
                  <span className="participant-id">{p.id}</span>
                  <span className="participant-name">{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    export default App;
