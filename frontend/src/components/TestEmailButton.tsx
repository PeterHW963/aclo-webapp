import { useState } from 'react';

const TestEmailButton = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const sendTestEmail = async () => {
        if (!email) return;

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/test/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Email sent! Check your inbox.');
            } else {
                setMessage(data.message || 'Failed to send.');
            }
        } catch (error) {
            setMessage('Error connecting to server.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0' }}>
            <h3>Test Email Integration</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ padding: '8px' }}
                />
                <button
                    onClick={sendTestEmail}
                    disabled={loading || !email}
                    style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {loading ? 'Sending...' : 'Send Test Email'}
                </button>
            </div>
            {message && <p style={{ marginTop: '10px', color: message.includes('sent') ? 'green' : 'red' }}>{message}</p>}
        </div>
    );
};

export default TestEmailButton;