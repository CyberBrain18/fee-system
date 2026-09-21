const BASE_URL = 'http://localhost:3000';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function getStudents() {
  return request('/students');
}

export function getStudentBalance(assignmentId: string) {
  return request(`/fee-assignments/${assignmentId}/balance`);
}

export function getInstallments(assignmentId: string) {
  return request(`/fee-assignments/${assignmentId}/installments`);
}

export function getStudent(id: string) {
  return request(`/students/${id}`);
}

export function recordPayment(data: { feeAssignmentId: string; installmentId?: string; amount: number }) {
  return request('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getFeeRules() {
  return request('/fee-rules');
}
