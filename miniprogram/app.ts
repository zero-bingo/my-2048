// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    if (!wx.cloud) return;
    wx.cloud.init({
      env: 'your-env-id', // 可先留空
      traceUser: true,
    });
  },
});