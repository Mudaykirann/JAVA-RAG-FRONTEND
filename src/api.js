/**
 * API Service for Java-RAG Backend (Spring Boot + Spring AI)
 */

const STORAGE_KEY = 'rag_backend_url';
export const DEFAULT_BACKEND_URL = 'http://localhost:8081';

export function getBackendUrl() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_BACKEND_URL;
}

export function setBackendUrl(url) {
  if (!url || url.trim() === '') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, url.trim().replace(/\/+$/, ''));
  }
}

async function request(endpoint, options = {}) {
  const baseUrl = getBackendUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errMsg = `Server returned HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        errMsg = errJson.message || errJson.error || errMsg;
      } catch {
        const text = await res.text();
        if (text) errMsg = text;
      }
      throw new Error(errMsg);
    }

    // Handle responses that might be text or JSON
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Failed to reach backend at ${baseUrl}. Ensure Spring Boot application is running on port 8081.`);
    }
    throw error;
  }
}

/**
 * Ask a question grounded in vector knowledge base (Multi-Turn RAG)
 * @param {string} question 
 * @param {string|null} conversationId
 * @returns {Promise<{ answer: string, conversationId: string }>}
 */
export async function askQuestion(question, conversationId = null) {
  return request('/api/ai/ask', {
    method: 'POST',
    body: JSON.stringify({ question, conversationId }),
  });
}

/**
 * Clear conversation memory for a given conversationId
 * @param {string} conversationId 
 */
export async function clearConversation(conversationId) {
  if (!conversationId) return;
  return request(`/api/ai/ask/${encodeURIComponent(conversationId)}`, {
    method: 'DELETE',
  });
}

/**
 * Ingest raw text document into vector store (pgvector)
 * @param {string} content 
 * @returns {Promise<string>}
 */
export async function ingestDocument(content) {
  return request('/api/ai/documents', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

/**
 * Upload a document file (PDF, DOCX, TXT, etc.) for extraction and vector indexing
 * @param {File} file 
 * @returns {Promise<{ fileName: string, chunkCount: number, sizeBytes: number, message: string }>}
 */
export async function uploadDocumentFile(file) {
  const baseUrl = getBackendUrl();
  const url = `${baseUrl}/api/ai/documents/upload`;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errMsg = `Server returned HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        errMsg = errJson.message || errJson.error || errMsg;
      } catch {
        const text = await res.text();
        if (text) errMsg = text;
      }
      throw new Error(errMsg);
    }

    return await res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Failed to reach backend at ${baseUrl}. Ensure Spring Boot application is running on port 8081.`);
    }
    throw error;
  }
}

/**
 * General LLM Chat without vector retrieval
 * @param {string} message 
 * @returns {Promise<{ answer: string }>}
 */
export async function sendChatMessage(message) {
  return request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

/**
 * Summarize text into structured JSON (SummaryResponse)
 * @param {string} text 
 * @returns {Promise<{ title: string, summary: string, keyPoints: string[] }>}
 */
export async function summarizeText(text) {
  return request('/api/ai/summarize', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

/**
 * Probe backend to check if it's reachable and measure latency
 * @returns {Promise<{ ok: boolean, latencyMs: number, error?: string }>}
 */
export async function checkBackendHealth() {
  const start = performance.now();
  try {
    // Send a minimal request to /api/ai/chat to verify Spring AI is responsive
    const res = await sendChatMessage('ping');
    const latencyMs = Math.round(performance.now() - start);
    return { ok: true, latencyMs, response: res };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return { ok: false, latencyMs, error: err.message };
  }
}
