"use client";

import { useEffect, useState } from "react";

interface Log {
  id: string;
  date: string;
  time: string;
  category: string;
  activity: string;
  skills: string;
  challenges: string;
  solutions: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
        } else {
          console.error("Failed to fetch logs");
        }
      } catch (error) {
        console.error("An error occurred while fetching logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Log Book</h1>
      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <div className="space-y-4">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="p-4 border rounded-md">
                <p><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</p>
                {log.time && <p><strong>Time:</strong> {log.time}</p>}
                <p><strong>Category:</strong> {log.category}</p>
                <p><strong>Activity:</strong> {log.activity}</p>
                {log.skills && <p><strong>Skills Gained:</strong> {log.skills}</p>}
                {log.challenges && <p><strong>Challenges Faced:</strong> {log.challenges}</p>}
                {log.solutions && <p><strong>Solutions Applied:</strong> {log.solutions}</p>}
              </div>
            ))
          ) : (
            <p>No logs found.</p>
          )}
        </div>
      )}
    </div>
  );
}