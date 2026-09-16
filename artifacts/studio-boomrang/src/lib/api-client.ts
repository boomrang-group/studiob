export type GenerateLessonContentInput = any;
export type GenerateQuizOutput = {
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
  }>;
};

type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

async function postJson<T>(path: string, input: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(input),
  });
  const payload = await res.json();

  if (!res.ok && !payload?.error) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return payload as T;
}

export async function generateLessonContent(input: any) {
  try {
    return await postJson<ApiResult<{ lessonContent: string }>>(
      '/api/generate-lesson',
      input,
    );
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function generateVideoScript(input: any) {
  try {
    return await postJson<ApiResult<{ script: string }>>(
      '/api/generate-script',
      input,
    );
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function generateQuiz(input: any) {
  try {
    return await postJson<ApiResult<GenerateQuizOutput>>(
      '/api/generate-quiz',
      input,
    );
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function summarizeDocument(input: any) {
  try {
    return await postJson<ApiResult<{ summary: string }>>(
      '/api/summarize-document',
      input,
    );
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function generateAudioSummary(summaryText: string) {
  try {
    return await postJson<ApiResult<{ media: string }>>(
      '/api/generate-audio-summary',
      { summaryText },
    );
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function generateAudioDialogue(summary: string) {
  try {
    return await postJson<ApiResult<{ media: string }>>(
      '/api/generate-audio-dialogue',
      { summary },
    );
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function updateSubscription(input: any) {
  try {
    const data = await postJson<{ success?: boolean; error: string | null }>(
      '/api/update-subscription',
      input,
    );
    return { success: data.success ?? false, error: data.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
