import React from 'react';

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.warn('App view failed:', error.name); }
  render() {
    if (this.state.failed) return <div role="alert" className="mx-auto max-w-lg p-8 text-center">
      <h2 className="text-xl font-bold">Chưa mở được màn hình này</h2>
      <p className="my-4">Có thể kết nối bị gián đoạn hoặc app vừa được cập nhật. Kết quả đã đưa vào hàng đợi vẫn được giữ trên trình duyệt này.</p>
      <button className="rounded-xl bg-blue-600 px-4 py-3 text-white" onClick={() => window.location.reload()}>Tải lại ứng dụng</button>
    </div>;
    return this.props.children;
  }
}
