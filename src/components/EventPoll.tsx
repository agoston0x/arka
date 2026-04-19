'use client';

import { useEffect, useState } from 'react';

const API_URL = 'https://arka-api.claws.page';

interface PollOption {
  id: number;
  text: string;
  votes: string[];
}

interface Poll {
  question: string;
  options: PollOption[];
  createdAt: string;
}

interface EventPollProps {
  eventId: string;
  userId: string;
  isHost: boolean;
}

export default function EventPoll({ eventId, userId, isHost }: EventPollProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Fetch poll
    fetch(`${API_URL}/events/${eventId}/poll`)
      .then(res => res.ok ? res.json() : null)
      .then(data => data?.poll && setPoll(data.poll))
      .catch(() => {});

    // Connect WebSocket for real-time updates
    const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const socket = new WebSocket(`${wsUrl}/ws/event/${eventId}/chat`);
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'poll_created' || message.type === 'poll_updated') {
        setPoll(message.poll);
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [eventId]);

  const createPoll = async () => {
    const validOptions = options.filter(opt => opt.trim());
    if (!question.trim() || validOptions.length < 2) {
      alert('Please provide a question and at least 2 options');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options: validOptions }),
      });
      if (res.ok) {
        setShowCreateForm(false);
        setQuestion('');
        setOptions(['', '']);
      }
    } catch (err) {
      console.error('Failed to create poll:', err);
    }
  };

  const vote = async (optionIndex: number) => {
    try {
      await fetch(`${API_URL}/events/${eventId}/poll/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, optionIndex }),
      });
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  if (!poll && !isHost) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <p className="text-sm text-black/40">No active poll</p>
      </div>
    );
  }

  if (!poll && isHost) {
    if (showCreateForm) {
      return (
        <div className="p-4">
          <h3 className="mb-4 text-lg font-bold text-arka-text">Create Poll</h3>
          
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-black/60">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What should we discuss next?"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-arka-pink focus:outline-none"
            />
          </div>

          <div className="mb-4 space-y-2">
            <label className="mb-1 block text-xs font-medium text-black/60">Options</label>
            {options.map((opt, i) => (
              <input
                key={i}
                type="text"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
                placeholder={`Option ${i + 1}`}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-arka-pink focus:outline-none"
              />
            ))}
            <button
              onClick={() => setOptions([...options, ''])}
              className="text-xs text-arka-pink"
            >
              + Add option
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={createPoll}
              className="flex-1 rounded-lg bg-arka-pink px-4 py-3 text-sm font-semibold text-white"
            >
              Create Poll
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-black/40"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center p-4">
        <button
          onClick={() => setShowCreateForm(true)}
          className="rounded-xl bg-arka-pink px-6 py-4 text-sm font-semibold text-white"
        >
          📊 Create Poll
        </button>
      </div>
    );
  }

  if (!poll) return null;

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
  const userVote = poll.options.findIndex(opt => opt.votes.includes(userId));

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-bold text-arka-text">{poll.question}</h3>

      <div className="space-y-3">
        {poll.options.map((opt, i) => {
          const percentage = totalVotes > 0 ? (opt.votes.length / totalVotes) * 100 : 0;
          const isUserVote = userVote === i;

          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={userVote !== -1}
              className={`relative w-full overflow-hidden rounded-lg border p-3 text-left transition ${
                isUserVote
                  ? 'border-arka-pink bg-arka-pink/10'
                  : 'border-black/10 bg-white hover:border-arka-pink/50'
              } ${userVote !== -1 ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div
                className="absolute inset-0 bg-arka-pink/10 transition-all"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex items-center justify-between">
                <span className="text-sm font-medium text-arka-text">{opt.text}</span>
                <span className="text-xs font-semibold text-arka-pink">
                  {opt.votes.length} ({Math.round(percentage)}%)
                </span>
              </div>
              {isUserVote && (
                <p className="relative mt-1 text-[10px] text-arka-pink">✓ Your vote</p>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-black/40">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''} · {new Date(poll.createdAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
