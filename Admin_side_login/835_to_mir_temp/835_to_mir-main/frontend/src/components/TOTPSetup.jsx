import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function TOTPSetup() {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    try {
      const response = await authAPI.totpSetup();
      setQrCode(response.data.qr_code);
      setSecret(response.data.secret);
      setLoading(false);
    } catch (err) {
      setError('Failed to generate QR code');
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setVerifying(true);

    try {
      const response = await authAPI.totpSetupVerify(code);
      setRecoveryCodes(response.data.recovery_codes);
      setVerified(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Two-Factor Authentication Setup</h1>
        <p>
          Scan the QR code below with your authenticator app (Google
          Authenticator, Microsoft Authenticator, etc.)
        </p>

        {error && <div className="error">{error}</div>}

        {!verified ? (
          <>
            <div className="qr-container">
              <div className="qr-code">
                <img src={qrCode} alt="QR Code" />
              </div>
            </div>

            <p className="center">Or enter this code manually:</p>
            <div className="secret-code">{secret}</div>

            <form onSubmit={handleVerify}>
              <label>Enter the 6-digit code from your app</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength="6"
                placeholder="000000"
                required
                autoFocus
              />

              <button type="submit" disabled={verifying}>
                {verifying ? 'Verifying...' : 'Verify and Enable'}
              </button>
            </form>
          </>
        ) : (
          <div className="recovery-codes">
            <h3>⚠️ Save Your Recovery Codes</h3>
            <p>
              Store these codes in a safe place. You can use them to access your
              account if you lose your device.
            </p>

            <div className="recovery-codes-list">
              {recoveryCodes.map((recoveryCode, index) => (
                <code key={index}>{recoveryCode}</code>
              ))}
            </div>

            <button
              onClick={handleContinue}
              style={{ marginTop: '20px' }}
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TOTPSetup;
