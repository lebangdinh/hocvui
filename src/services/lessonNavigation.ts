/**
 * Exit policy for the practice and self-challenge screens.
 * Never treat unfinished exercises as completed activities.
 */
export type LessonExitDestination = 'subject' | 'home';

export interface LessonExitState {
  loading: boolean;
  hasQuestions: boolean;
  finished: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isSaving: boolean;
}

export function getLessonExitDecision(state: LessonExitState, destination: LessonExitDestination): {
  blocked: boolean;
  confirmation: string | null;
} {
  if (state.isSaving || state.saveStatus === 'saving') {
    return { blocked: true, confirmation: null };
  }
  const destinationLabel = destination === 'home' ? 'trang chính' : 'màn hình chọn bài';
  if (state.finished && state.saveStatus !== 'saved') {
    return {
      blocked: false,
      confirmation: `Kết quả chưa được lưu thành công. Nếu về ${destinationLabel} lúc này, sao và lịch sử bài vừa làm có thể chưa được ghi nhận. Anh/chị vẫn muốn rời không?`
    };
  }
  if (!state.finished && !state.loading && state.hasQuestions) {
    return {
      blocked: false,
      confirmation: `Bé đang làm dở bài này. Nếu về ${destinationLabel}, bài chưa hoàn thành sẽ không được tính điểm và không thể tiếp tục từ câu hiện tại. Anh/chị có muốn rời bài không?`
    };
  }
  return { blocked: false, confirmation: null };
}
