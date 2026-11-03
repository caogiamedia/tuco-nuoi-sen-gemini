import React, { useState, useEffect } from 'react';

// 1. CẤU HÌNH THANH TOÁN
const BANK_CONFIG = {
  bankId: 'MB', 
  accountNo: '0988784786', 
  accountName: 'CAO BA THANG', 
};

// 2. DỮ LIỆU CÔNG VIỆC (Mục tiêu nối tiếp nhau)
const JOB_MILESTONES = [
  { id: 1, title: 'Cứu đói khẩn cấp', target: 100000, icon: '🍜', desc: 'Đổ đầy bát Pate để Tuco cày cuốc đêm nay.' },
  { id: 2, title: 'Duy trì kết nối (Wifi)', target: 500000, icon: '⚡', desc: 'Đóng tiền mạng tháng này để chốt đơn.' },
  { id: 3, title: 'Chuộc xe máy cũ', target: 2000000, icon: '🛵', desc: 'Sửa xe máy để Sen đi ship hàng.' },
  { id: 4, title: 'Sắm Laptop mới', target: 5000000, icon: '💻', desc: 'Cần máy xịn để gõ code nhanh hơn.' },
];

// 3. DỮ LIỆU AFFILIATE & THỐNG KÊ
const AFFILIATE_PRODUCTS = [
  { id: 1, name: 'Pate Mèo Snappy Tom 400g', desc: 'Đồ ăn khoái khẩu', price: '45.000đ', icon: '🥫', link: 'https://shopee.vn/...' },
  { id: 2, name: 'Bàn phím cơ DareU EK810', desc: 'Gõ êm móng vuốt', price: '499.000đ', icon: '⌨️', link: 'https://shopee.vn/...' },
];

const PROVINCE_STATS = [
  { name: 'Hà Nội', amount: 15200000, percentage: 85 },
  { name: 'TP. Hồ Chí Minh', amount: 12500000, percentage: 70 },
  { name: 'Đà Nẵng', amount: 4300000, percentage: 40 },
];

// 4. THỜI TIẾT TRONG PHÒNG
const WINDOW_WEATHER = [
  { id: 'sunny', sky: 'bg-sky-300', celestial: '☀️', top: 'top-2', right: 'right-2', effect: '', text: 'Nắng đẹp' },
  { id: 'rainy', sky: 'bg-slate-400', celestial: '☁️', top: 'top-1', right: 'right-4', effect: 'window-rain', text: 'Mưa rào' },
  { id: 'night', sky: 'bg-indigo-950', celestial: '🌕', top: 'top-3', right: 'right-3', effect: 'stars', text: 'Đêm khuya' }
];

export default function App() {
  const [totalRaised, setTotalRaised] = useState(() => {
    const saved = localStorage.getItem('tuco_total_raised');
    return saved ? Number(saved) : 15000; 
  });
  const [selectedQR, setSelectedQR] = useState(null);
  const [copied, setCopied] = useState(false);
  const [weatherIndex, setWeatherIndex] = useState(0);

  // States Bức tường lời chúc
  const [wishes, setWishes] = useState(() => {
    const saved = localStorage.getItem('tuco_wishes');
    return saved ? JSON.parse(saved) : [{ id: 1, name: 'Cô Tư', amount: 50000, message: 'Lì xì Tuco bát phở!', time: '10 phút trước' }];
  });
  const [newWish, setNewWish] = useState({ name: '', amount: '', message: '' });

  // States Việc làm
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('tuco_jobs');
    return saved ? JSON.parse(saved) : [{ id: 1, title: 'Mẫu ảnh xăm móng chân', salary: '200k/giờ', status: 'Đang xem xét' }];
  });
  const [newJob, setNewJob] = useState({ title: '', salary: '' });

  useEffect(() => {
    localStorage.setItem('tuco_total_raised', totalRaised.toString());
    localStorage.setItem('tuco_wishes', JSON.stringify(wishes));
    localStorage.setItem('tuco_jobs', JSON.stringify(jobs));
  }, [totalRaised, wishes, jobs]);

  const weather = WINDOW_WEATHER[weatherIndex];
  
  // Tính toán tiến độ công việc
  const currentJobIndex = JOB_MILESTONES.findIndex(job => totalRaised < job.target);
  const activeJob = currentJobIndex !== -1 ? JOB_MILESTONES[currentJobIndex] : JOB_MILESTONES[JOB_MILESTONES.length - 1];
  const prevTarget = currentJobIndex > 0 ? JOB_MILESTONES[currentJobIndex - 1].target : 0;
  const currentJobProgress = currentJobIndex !== -1 ? Math.min(100, Math.max(0, ((totalRaised - prevTarget) / (activeJob.target - prevTarget)) * 100)) : 100;

  const cycleWeather = () => setWeatherIndex((prev) => (prev + 1) % WINDOW_WEATHER.length);
  
  const getBowlStatus = () => {
    if (currentJobProgress === 0) return "Bát trống không 😿";
    if (currentJobProgress < 30) return "Mới lót đáy bát";
    if (currentJobProgress < 70) return "Được nửa bát rồi 😻";
    if (currentJobProgress < 100) return "Sắp đầy bát rồi!!";
    return "Bát đầy ắp 🏆";
  };

  const generateQRUrl = (amount, memo) => `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(`Tuco ${memo}`)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWishSubmit = (e) => {
    e.preventDefault();
    if (!newWish.name || !newWish.message) return;
    const amountVal = Number(newWish.amount) || 20000;
    setWishes([{ id: Date.now(), name: newWish.name, amount: amountVal, message: newWish.message, time: 'Vừa xong' }, ...wishes]);
    setTotalRaised(prev => prev + amountVal);
    setNewWish({ name: '', amount: '', message: '' });
  };

  const handleJobSubmit = (e) => {
    e.preventDefault();
    if (!newJob.title) return;
    setJobs([{ id: Date.now(), title: newJob.title, salary: newJob.salary || 'Thỏa thuận', status: 'Chờ duyệt' }, ...jobs]);
    setNewJob({ title: '', salary: '' });
    alert("Đã gửi gợi ý việc làm cho Tuco!");
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] font-sans text-gray-800 p-2 md:p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ================= CỘT TRÁI: PHÒNG LÀM VIỆC (STICKY) ================= */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-6 h-fit">
          
          {/* SÂN KHẤU CĂN PHÒNG */}
          <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[2rem] border-[8px] border-[#d4bca4] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] group bg-[#f0e4d4]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/little-pluses.png')] opacity-40 mix-blend-multiply pointer-events-none"></div>

            {/* Cửa sổ Thời tiết */}
            <div className="absolute top-8 right-8 w-28 h-40 border-[6px] border-[#7a5c3d] rounded-t-full bg-white shadow-inner overflow-hidden flex flex-col z-10">
              <div className={`relative flex-1 transition-colors duration-1000 ${weather.sky}`}>
                <div className={`absolute text-4xl transition-all duration-1000 ${weather.top} ${weather.right}`}>{weather.celestial}</div>
                {weather.effect === 'window-rain' && <div className="absolute inset-0 rain-layer"></div>}
                {weather.effect === 'stars' && <div className="absolute inset-0 stars-layer opacity-50"></div>}
              </div>
              <div className="w-full h-1 bg-[#7a5c3d] absolute top-1/2"></div>
              <div className="absolute top-0 left-0 w-6 h-full bg-red-800/80 rounded-br-[50px] shadow-[2px_0_5px_rgba(0,0,0,0.3)]"></div>
              <div className="absolute top-0 right-0 w-6 h-full bg-red-800/80 rounded-bl-[50px] shadow-[-2px_0_5px_rgba(0,0,0,0.3)]"></div>
            </div>

            {/* Khung tranh trang trí BÁT PATE trên tường */}
            <div className="absolute top-10 left-10 w-20 h-28 border-4 border-[#7a5c3d] bg-[#fdfbf7] shadow-md z-10 flex flex-col items-center justify-center rotate-[-3deg] rounded-sm">
              <span className="text-3xl drop-shadow-sm">🥣</span>
              <span className="text-[7px] font-black text-[#7a5c3d] mt-1.5 uppercase tracking-widest text-center px-1">Pate<br/>Ước Mơ</span>
            </div>

            <button onClick={cycleWeather} className="absolute top-3 left-3 bg-white/80 border border-[#7a5c3d] rounded-full px-2 py-1 text-[10px] font-bold text-[#6b4a2c] z-20 shadow-sm active:scale-95">
              👁️ {weather.text}
            </button>

            {/* Bàn làm việc & Tuco */}
            <div className="absolute bottom-0 w-full h-[40%] bg-[#e3cdb1] border-t-[6px] border-[#c4a98b] shadow-[inset_0_20px_20px_rgba(0,0,0,0.05)] z-0 pb-8 px-6">
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-16 bg-red-900/10 rounded-full blur-md"></div>
            </div>

            <div className="absolute bottom-[5%] left-[5%] z-20 flex items-end gap-2 md:gap-4">
              <img src="/tuco_working.png" alt="Tuco" className="w-40 h-40 md:w-56 md:h-56 object-contain filter drop-shadow-2xl z-20" />
              
              <div className="hidden md:flex flex-col items-center justify-end z-10 -ml-12 mb-2">
                <div className="w-20 h-14 bg-gray-300 rounded-t-xl border-4 border-gray-400 flex justify-center"><span className="text-xl animate-pulse">💻</span></div>
                <div className="w-28 h-2 bg-gray-400 rounded-b-xl shadow-lg"></div>
              </div>

              {/* Bát Pate Động */}
              <div className="flex flex-col items-center mb-1 z-30 group relative">
                <div className="absolute -top-8 bg-white border-2 border-orange-300 rounded-lg px-2 py-1 text-[10px] font-bold text-orange-700 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                  {getBowlStatus()} ({Math.round(currentJobProgress)}%)
                </div>
                <div className="relative w-16 h-8 md:w-24 md:h-12 bg-gray-200 border-4 border-gray-400 rounded-b-full overflow-hidden shadow-xl flex items-end">
                  <div className="w-full bg-[#8B4513] transition-all duration-1000 ease-out" style={{ height: `${currentJobProgress}%` }}>
                    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')] opacity-30"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NÚT LÌ XÌ */}
          <button onClick={() => setSelectedQR({ name: activeJob.title, amount: Math.max(10000, activeJob.target - totalRaised), icon: '🥫' })} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 rounded-[1.5rem] p-4 text-center shadow-lg text-white transition-all transform active:scale-95 group border border-orange-400">
            <div className="text-xl font-black drop-shadow-md group-hover:animate-pulse">⚡ LÌ XÌ ĐỔ ĐẦY BÁT CHO TUCO</div>
          </button>

          {/* NHẬT KÝ */}
          <div className="w-full bg-[#d9c4aa] border-[3px] border-[#a68460] rounded-2xl p-3 flex flex-col shadow-lg mt-2">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="font-black text-[#5c3a21] text-sm flex items-center gap-2">
                📝 Nhật ký Freelancer
              </span>
              <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded animate-pulse font-bold">Live</span>
            </div>
            
            <div className="bg-[#fdfbf7] border-2 border-[#a68460] rounded-xl p-3 h-40 overflow-y-auto space-y-2 custom-scroll shadow-inner">
              <div className="bg-[#fef9eb] border border-[#e8d5b5] p-2 rounded-lg text-xs leading-relaxed shadow-sm">
                <span className="bg-orange-200 text-orange-800 font-bold px-1.5 py-0.5 rounded text-[10px] mr-1">10:05</span>
                <span className="font-black text-green-700 mr-1">[Tuco]</span>
                <span className="text-[#5c3a21] font-medium">Bát pate mới được {Math.round(currentJobProgress)}%. Bụng sôi réo rắt. Cố gắng cày thôi! 😿</span>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg text-xs leading-relaxed shadow-sm">
                <span className="bg-blue-200 text-blue-800 font-bold px-1.5 py-0.5 rounded text-[10px] mr-1">09:30</span>
                <span className="font-black text-blue-700 mr-1">[Sen]</span>
                <span className="text-[#5c3a21] font-medium">Cô chú donate giúp Tuco đầy bát nhé, nãy giờ gõ phím mỏi tay móng vuốt mòn hết rồi.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: TẤT CẢ CÁC MỤC (SCROLL) ================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* TỔNG QUỸ & LỘ TRÌNH KHÓA/MỞ (LOCKED / UNLOCKED) */}
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-xs font-black text-orange-800 uppercase tracking-widest">Tổng quỹ đã nhận</h2>
                <div className="text-4xl font-black text-orange-500">{totalRaised.toLocaleString()} đ</div>
              </div>
            </div>
            
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-t pt-4">📋 Lộ trình Mục tiêu (Tuần tự)</h2>
            <div className="space-y-3">
              {JOB_MILESTONES.map((job, index) => {
                const isDone = totalRaised >= job.target;
                const isCurrent = index === currentJobIndex;
                const isLocked = index > currentJobIndex && currentJobIndex !== -1; // Khóa các mục tiêu phía sau

                return (
                  <div key={job.id} className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                    isDone 
                      ? 'bg-green-50/50 border-green-200' 
                      : isCurrent 
                        ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-100' 
                        : 'bg-gray-100 border-gray-200 opacity-60' // Trạng thái khóa mờ đi
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {isDone ? '✅' : isLocked ? '🔒' : job.icon}
                      </span>
                      <div>
                        <div className={`font-extrabold text-sm flex items-center gap-2 ${isDone ? 'text-green-800' : isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                          {job.title}
                          {isLocked && <span className="text-[9px] bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded font-bold uppercase">Đang khóa</span>}
                        </div>
                        <div className="text-[11px] text-gray-500">{job.desc}</div>
                      </div>
                    </div>

                    {/* Nút bấm chỉ sáng khi đây là mục tiêu hiện tại (isCurrent). Đã xong hoặc bị khóa thì không bấm được */}
                    {!isDone && (
                      <button 
                        onClick={() => !isLocked && setSelectedQR({ name: job.title, amount: Math.max(10000, job.target - totalRaised), icon: job.icon })} 
                        disabled={isLocked}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all ${
                          isLocked 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300' 
                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                        }`}
                      >
                        {isLocked ? 'Chưa mở' : 'Ủng hộ'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỬA HÀNG AFFILIATE */}
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">🛍️ Cửa hàng của Tuco</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AFFILIATE_PRODUCTS.map(product => (
                <a key={product.id} href={product.link} target="_blank" rel="noreferrer" className="flex items-center p-3 border rounded-xl hover:border-orange-300 bg-gray-50/50 group">
                  <div className="text-2xl group-hover:scale-110 transition-transform bg-white w-10 h-10 flex items-center justify-center rounded-lg shadow-sm">{product.icon}</div>
                  <div className="ml-3">
                    <div className="font-bold text-sm text-gray-900">{product.name}</div>
                    <div className="text-[11px] text-gray-500">{product.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* GỢI Ý VIỆC LÀM */}
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">💼 Gợi ý việc làm</h2>
            <form onSubmit={handleJobSubmit} className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-200">
              <div className="flex gap-2 mb-2">
                <input type="text" placeholder="Tên công việc..." value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="flex-1 p-2 rounded-lg border text-sm" required />
                <input type="text" placeholder="Lương..." value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-1/3 p-2 rounded-lg border text-sm" />
              </div>
              <button type="submit" className="w-full bg-zinc-800 text-white font-bold py-2 rounded-lg text-sm">Gửi Job</button>
            </form>
            <div className="space-y-2">
              {jobs.map(job => (
                <div key={job.id} className="flex justify-between items-center p-2.5 bg-white border rounded-lg text-sm">
                  <span className="font-bold">{job.title} <span className="text-orange-600 text-xs font-medium ml-1">({job.salary})</span></span>
                  <span className={`text-[9px] px-2 py-1 rounded font-bold ${job.status.includes('Chờ') ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{job.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BỨC TƯỜNG LỜI CHÚC */}
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">💌 Bức Tường Lời Chúc</h2>
            <form onSubmit={handleWishSubmit} className="bg-orange-50 p-4 rounded-2xl mb-6 border border-orange-100">
              <div className="flex gap-2 mb-3">
                <input type="text" placeholder="Tên..." value={newWish.name} onChange={e => setNewWish({...newWish, name: e.target.value})} className="flex-1 p-2 rounded-lg border text-sm" required />
                <input type="number" placeholder="Số tiền..." value={newWish.amount} onChange={e => setNewWish({...newWish, amount: e.target.value})} className="w-1/3 p-2 rounded-lg border text-sm" />
              </div>
              <textarea placeholder="Lời nhắn..." value={newWish.message} onChange={e => setNewWish({...newWish, message: e.target.value})} className="w-full p-2 rounded-lg border text-sm h-16 mb-2" required></textarea>
              <button type="submit" className="w-full bg-orange-500 text-white font-bold py-2 rounded-lg text-sm">Gửi Lời Chúc</button>
            </form>
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scroll pr-1">
              {wishes.map(wish => (
                <div key={wish.id} className="bg-gray-50 p-3 rounded-xl border flex gap-3">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700 shrink-0">{wish.name.charAt(0)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between"><span className="font-bold text-sm">{wish.name}</span><span className="text-xs text-green-600 font-bold">+{wish.amount.toLocaleString()}đ</span></div>
                    <p className="text-xs text-gray-600 mt-1">{wish.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BẢN ĐỒ THỐNG KÊ (CUỐI TRANG) */}
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">🗺️ Thống kê 3 Miền</h2>
            <div className="space-y-4">
              {PROVINCE_STATS.map((prov, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold mb-1"><span>{prov.name}</span><span className="text-orange-600">{prov.amount.toLocaleString()}đ</span></div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-amber-400 h-full" style={{ width: `${prov.percentage}%` }}></div></div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* POPUP QR */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff9eb] w-full max-w-sm rounded-[2rem] p-6 text-center shadow-2xl border-4 border-[#9E7B56] relative">
            <button onClick={() => setSelectedQR(null)} className="absolute top-3 right-3 text-[#9E7B56] hover:bg-[#e8d5b5] font-bold w-8 h-8 rounded-full">✕</button>
            <span className="text-4xl">{selectedQR.icon}</span>
            <h3 className="text-lg font-black mt-2">Ủng hộ: {selectedQR.name}</h3>
            <p className="font-bold text-orange-600">Số tiền: {selectedQR.amount.toLocaleString()} VNĐ</p>
            <div className="mt-4 p-3 bg-white border-2 border-dashed border-[#9E7B56] rounded-2xl inline-block">
              <img src={generateQRUrl(selectedQR.amount, selectedQR.name)} alt="QR" className="w-48 h-48 object-contain rounded-xl" />
            </div>
            <div className="mt-4 flex justify-between bg-orange-50 p-3 rounded-xl border border-orange-200">
              <div className="text-left"><div className="text-[10px] text-gray-500 font-bold">{BANK_CONFIG.bankId}</div><div className="font-black">{BANK_CONFIG.accountNo}</div></div>
              <button onClick={() => copyToClipboard(BANK_CONFIG.accountNo)} className={`px-3 py-1 text-xs font-bold rounded-lg text-white ${copied ? 'bg-green-500' : 'bg-orange-500'}`}>{copied ? 'Đã chép' : 'Copy STK'}</button>
            </div>
          </div>
        </div>
      )}

      {/* CSS HIỆU ỨNG */}
      <style dangerouslySetInnerHTML={{__html: `
        .window-rain { background-image: repeating-linear-gradient(15deg, transparent, transparent 15px, rgba(255,255,255,0.4) 16px, rgba(255,255,255,0.4) 17px); background-size: 200% 200%; animation: rain-fall 0.6s linear infinite; }
        @keyframes rain-fall { 0% { background-position: 0% 0%; } 100% { background-position: -30px 60px; } }
        .stars-layer { background-image: radial-gradient(white 1px, transparent 1px); background-size: 20px 20px; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}} />
    </div>
  );
}