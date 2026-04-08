export interface Challenge {
  id: number;
  content: string;
  time: string;
  stars: number;
  category: 'Arts' | 'Reflex' | 'Funny' | 'Knowledge' | 'Communication';
  cheer: string;
  emojis: string[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: 1,
    content: "Bạn hãy hát một đoạn bất kỳ của bài hát mà bạn yêu thích.",
    time: "30 giây",
    stars: 4,
    category: 'Arts',
    cheer: "Giọng hát vàng của lớp đây rồi!",
    emojis: ["🎤", "🎶", "✨"]
  },
  {
    id: 2,
    content: "Bạn hãy đứng bằng 1 chân và đếm từ 1 đến 10 trong vòng 10 giây.",
    time: "10 giây",
    stars: 3,
    category: 'Reflex',
    cheer: "Giữ thăng bằng siêu đỉnh!",
    emojis: ["🦶", "⚖️", "⏱️"]
  },
  {
    id: 3,
    content: "Nói 5 môn học trong trường càng nhanh càng tốt.",
    time: "10 giây",
    stars: 3,
    category: 'Knowledge',
    cheer: "Nhanh như chớp luôn!",
    emojis: ["📚", "⚡", "🧠"]
  },
  {
    id: 4,
    content: "Đứng lên, cúi đầu xuống (làm vòi voi) xoay 5 vòng tại chỗ trong 10 giây.",
    time: "10 giây",
    stars: 5,
    category: 'Funny',
    cheer: "Đừng để bị chóng mặt nhé!",
    emojis: ["🐘", "🌀", "😂"]
  },
  {
    id: 5,
    content: "Bạn hãy thực hiện 5 động tác dễ thương khi chụp ảnh.",
    time: "15 giây",
    stars: 4,
    category: 'Arts',
    cheer: "Tạo dáng chuyên nghiệp quá!",
    emojis: ["📸", "🥰", "✨"]
  },
  {
    id: 6,
    content: "Bạn hãy đọc thật nhanh (3 lần) mà không bị vấp câu: 'Lớp chúng tôi học tập chăm chỉ và đoàn kết'.",
    time: "15 giây",
    stars: 4,
    category: 'Communication',
    cheer: "Khẩu hiệu tuyệt vời của lớp mình!",
    emojis: ["🗣️", "🤝", "🔥"]
  },
  {
    id: 7,
    content: "Bạn hãy nhảy một điệu nhảy tự do trong 10 giây.",
    time: "10 giây",
    stars: 5,
    category: 'Arts',
    cheer: "Quẩy hết mình đi nào!",
    emojis: ["💃", "🕺", "🎵"]
  },
  {
    id: 8,
    content: "Bạn nhắm mắt lại, nghe các bạn diễn tả một người bạn trong lớp và hãy gọi tên người bạn đó.",
    time: "20 giây",
    stars: 4,
    category: 'Communication',
    cheer: "Thấu hiểu bạn bè quá đi!",
    emojis: ["🙈", "👥", "❓"]
  },
  {
    id: 9,
    content: "Bạn hãy tạo một tư thế tượng thật 'ngầu' và giữ 5 giây.",
    time: "5 giây",
    stars: 3,
    category: 'Funny',
    cheer: "Bức tượng đẹp nhất tôi từng thấy!",
    emojis: ["🗿", "😎", "✨"]
  },
  {
    id: 10,
    content: "Bạn hãy đọc khẩu hình 3 từ, các bạn trong lớp phải đoán từ đó.",
    time: "20 giây",
    stars: 4,
    category: 'Communication',
    cheer: "Thần giao cách cảm là đây!",
    emojis: ["👄", "🤔", "💡"]
  },
  {
    id: 11,
    content: "Bạn hãy nhìn lên bảng trong 3 giây và nói lại 5 từ giáo viên viết.",
    time: "3 giây",
    stars: 4,
    category: 'Knowledge',
    cheer: "Trí nhớ siêu phàm!",
    emojis: ["👁️", "📝", "🧠"]
  },
  {
    id: 12,
    content: "Giáo viên nói một chữ cái, học sinh nói 5 từ bắt đầu bằng chữ cái đó.",
    time: "15 giây",
    stars: 3,
    category: 'Knowledge',
    cheer: "Vốn từ vựng phong phú quá!",
    emojis: ["🔤", "🗣️", "📚"]
  },
  {
    id: 13,
    content: "Bạn hãy diễn tả cảm xúc bằng khuôn mặt để cả lớp đoán.",
    time: "15 giây",
    stars: 4,
    category: 'Funny',
    cheer: "Diễn viên triển vọng của lớp!",
    emojis: ["🎭", "😜", "😂"]
  },
  {
    id: 14,
    content: "Bạn hãy nói từ: 'học sinh – sinh học' 5 lần mà không bị vấp trong 10 giây.",
    time: "10 giây",
    stars: 5,
    category: 'Reflex',
    cheer: "Lẹo lưỡi chưa nào?",
    emojis: ["👅", "🔄", "⚡"]
  },
  {
    id: 15,
    content: "Bạn hãy diễn tả một môn học bằng hành động.",
    time: "15 giây",
    stars: 4,
    category: 'Funny',
    cheer: "Đố ai đoán được môn gì đây!",
    emojis: ["🏃", "🧪", "📐"]
  },
  {
    id: 16,
    content: "Bạn hãy hát một bài hát mà mình yêu thích.",
    time: "30 giây",
    stars: 4,
    category: 'Arts',
    cheer: "Idol của lớp mình đây rồi!",
    emojis: ["🎤", "🌟", "🎶"]
  },
  {
    id: 17,
    content: "Bạn hãy đếm từ 1 đến 10 và ngược lại thật nhanh trong 10 giây.",
    time: "10 giây",
    stars: 4,
    category: 'Reflex',
    cheer: "Nhanh quá, không kịp nghe luôn!",
    emojis: ["🔢", "🔄", "⚡"]
  },
  {
    id: 18,
    content: "Bạn hãy đứng một chân trong 10 giây.",
    time: "10 giây",
    stars: 3,
    category: 'Reflex',
    cheer: "Thăng bằng như một chú hạc!",
    emojis: ["🦶", "⚖️", "🦢"]
  },
  {
    id: 19,
    content: "Bạn hãy làm 3 điệu bộ giống như robot trong 10 giây.",
    time: "10 giây",
    stars: 4,
    category: 'Funny',
    cheer: "Robot phiên bản lớp mình!",
    emojis: ["🤖", "⚙️", "🔋"]
  },
  {
    id: 20,
    content: "Bạn hãy hát 3 từ đầu của một bài hát để cả lớp đoán tên bài hát.",
    time: "15 giây",
    stars: 4,
    category: 'Arts',
    cheer: "Thử thách âm nhạc bắt đầu!",
    emojis: ["🎵", "❓", "🎹"]
  }
];

export const STUDENTS = [
  "Đặng Thị Hoàng Anh",
  "Phan Minh Đạt",
  "Nguyễn Hải Đăng",
  "Võ Nhựt Đăng",
  "Nguyễn Trường Đông",
  "Dương Quốc Hùng",
  "Nguyễn Đỗ Ngọc Hân",
  "Trần Thị Như Huỳnh",
  "Trần Thị Hoài Hương",
  "Nguyễn Minh Khang",
  "Phan Duy Khang",
  "Nguyễn Văn Khánh",
  "Nguyễn Phan Thư Kỳ",
  "Trần Hiếu Kỳ",
  "Cao Tấn Lộc",
  "Trần Hữu Lượng",
  "Đặng Thị Kim Muội",
  "Bùi Quốc Nam",
  "Phạm Thị Kin Ngân",
  "Phạm Thị Thanh Ngân",
  "Hồ Bảo Ngọc",
  "Trần Nguyễn Như Ngọc",
  "Bùi Ngọc Bảo Nhi",
  "Nguyễn Thị Thu Nhi",
  "Nguyễn Thị Yến Nhi",
  "Diếp Thị Quỳnh Như",
  "Trần Thị Huỳnh Như",
  "Lê Minh Nhựt",
  "Nguyễn Minh Nhựt",
  "Thái Thị Ngọc Phụng",
  "Bùi Thị Yến Phương",
  "Trần Ngọc Nhã Phương",
  "Phạm Nguyễn Phương Quỳnh",
  "Nguyễn Phan Duy Tân",
  "Nguyễn Ngọc Thảo",
  "Nguyễn Thị Thu Thảo",
  "Nguyễn A Thế",
  "Ngô Trí Thiện",
  "Trần Thị Minh Thiện",
  "Trần Huỳnh Đức Thịnh",
  "Cao Thanh Tiền",
  "Nguyễn Lê Thanh Trà",
  "Nguyễn Lê Bảo Trâm",
  "Nguyễn Nhật Trường"
];

export const SOUND_EFFECTS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  generate: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  tick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  end: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  upbeat: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3',
  bgMusic: 'https://assets.mixkit.co/music/preview/mixkit-dance-with-me-3.mp3'
};
