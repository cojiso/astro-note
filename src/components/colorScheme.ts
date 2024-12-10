// src/lib/colorScheme.ts
export interface TimeColorScheme {
  id: string;
  startHour: number;
  colors: {
    sky: string[];      // 空の4色のグラデーション
    ground: string[];   // 地面の2色
    effects: string[];  // 光と影の2色
    description: string;  // 時間帯の説明
  };
}

export const timeColorSchemes: TimeColorScheme[] = [
  {
    id: 'dawn',
    startHour: 4,
    colors: {
      sky: [
        '#2E3440', // 最も暗い空
        '#3B4252', // 夜空から明け方へ
        '#434C5E', // 明け方の空
        '#4C566A'  // 薄明の空
      ],
      ground: [
        '#D8DEE9', // 明るい地平線
        '#E5E9F0'  // より明るい地面
      ],
      effects: [
        '#E5B676', // 街灯の温かみのある弱い光
        '#2B2F3B'  // ぼんやりとした街灯に染まる闇
      ],
      description: '夜明け前: 暗い青から薄明るい青へ'
    }
  },
  {
    id: 'morning',
    startHour: 6,
    colors: {
      sky: [
        '#81A1C1', // 朝方の空
        '#88C0D0', // 明るい朝空
        '#8FBCBB', // さらに明るい空
        '#5E81AC'  // 澄んだ青空
      ],
      ground: [
        '#A3BE8C', // 朝露の地面
        '#B9D39C'  // 明るい草地
      ],
      effects: [
        '#EBCB8B', // 朝日
        '#5B7DBA'  // 朝霧
      ],
      description: '朝: 青みがかった水色からクリアな青へ'
    }
  },
  {
    id: 'lateMorning',
    startHour: 9,
    colors: {
      sky: [
        '#88C0D0', // 明るい空
        '#81A1C1', // やや深い空
        '#5E81AC', // 深まる青空
        '#5171A1'  // 濃い青空
      ],
      ground: [
        '#EBCB8B', // 明るい地面
        '#E1B86B'  // 陽光を受けた地面
      ],
      effects: [
        '#E5E9F0', // モダニズム建築の壁面に差す光
        '#4C566A'  // コントラストの強い影
      ],
      description: '昼前: 澄んだ青から深い青へ'
    }
  },
  {
    id: 'noon',
    startHour: 12,
    colors: {
      sky: [
        '#81A1C1', // 明るい空
        '#7191B1', // やや深い空
        '#6181A1', // 深い空
        '#5E81AC'  // 濃い青空
      ],
      ground: [
        '#A3BE8C', // 緑の地面
        '#98B37E'  // 深い緑地
      ],
      effects: [
        '#EBCB8B', // 強い日差し
        '#596773'  // やや淡い影
      ],
      description: '真昼: 深い青から鮮やかな青へ'
    }
  },
  {
    id: 'afternoon',
    startHour: 15,
    colors: {
      sky: [
        '#81A1C1', // 午後の空
        '#8FBCBB', // 柔らかな空
        '#88C0D0', // 明るい空
        '#7DB5C5'  // 傾く陽の空
      ],
      ground: [
        '#D08770', // 温かな地面
        '#C57B63'  // 深い地面色
      ],
      effects: [
        '#EBCB8B', // 西日
        '#4C566A'  // 長い影
      ],
      description: '午後: 青から黄みの青へ'
    }
  },
  {
    id: 'sunset',
    startHour: 17,
    colors: {
      sky: [
        '#81A1C1', // 夕方の空
        '#B48EAD', // 紫がかる空
        '#D08770', // オレンジの空
        '#BF616A'  // 赤みの空
      ],
      ground: [
        '#A3BE8C', // 緑の地面
        '#98B37E'  // 深い緑地
      ],
      effects: [
        '#EBCB8B', // 夕陽
        '#3F4557'  // 影の中に残る昼の名残
      ],
      description: '夕暮れ: 青から橙へのグラデーション'
    }
  },
  {
    id: 'evening',
    startHour: 19,
    colors: {
      sky: [
        '#4C566A', // 宵の空
        '#434C5E', // 暮れゆく空
        '#3B4252', // 暗い夜空
        '#2E3440'  // より暗い夜空
      ],
      ground: [
        '#B48EAD', // 薄紫の地面
        '#A97D9C'  // 深い紫の地面
      ],
      effects: [
        '#5E81AC', // 月明かり
        '#2E3440'  // 夜の影
      ],
      description: '宵の時間: 暗い青からより暗い青へ'
    }
  },
  {
    id: 'night',
    startHour: 22,
    colors: {
      sky: [
        '#2E3440', // 最も暗い空
        '#2B3038', // より暗い夜空
        '#272B33', // 暗い夜空
        '#232830'  // 漆黒の空
      ],
      ground: [
        '#3B4252', // 暗い地面
        '#363D47'  // より暗い地面
      ],
      effects: [
        '#4C566A', // わずかな光
        '#1D2128'  // 深い闇
      ],
      description: '深夜: 濃紺から黒みの青へ'
    }
  }
];

export function getCurrentColorScheme(): TimeColorScheme {
  const hour = new Date().getHours();
  // const hour = 10;
  // 時間の逆順でソートした配列から最初にマッチするものを探す
  const sortedSchemes = [...timeColorSchemes].sort((a, b) => b.startHour - a.startHour);
  return sortedSchemes.find(scheme => hour >= scheme.startHour) ?? timeColorSchemes[0];
}

export function generateNatureGradient(colors: TimeColorScheme['colors']): string {
  const svg = `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- ソフトなグラデーション -->
        <linearGradient id="softGradient1" x1="40%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.sky[0]};stop-opacity:0.4" />
          <stop offset="50%" style="stop-color:${colors.ground[0]};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${colors.effects[0]};stop-opacity:0.4" />
        </linearGradient>

        <linearGradient id="softGradient2" x1="0%" y1="40%" x2="100%" y2="60%">
          <stop offset="0%" style="stop-color:${colors.sky[2]};stop-opacity:0.3" />
          <stop offset="50%" style="stop-color:${colors.ground[1]};stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:${colors.effects[1]};stop-opacity:0.3" />
        </linearGradient>

        <linearGradient id="softGradient3" x1="60%" y1="0%" x2="40%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.sky[1]};stop-opacity:0.3" />
          <stop offset="50%" style="stop-color:${colors.sky[3]};stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:${colors.effects[0]};stop-opacity:0.3" />
        </linearGradient>

        <!-- 放射状グラデーション -->
        <radialGradient id="radialBlend1" cx="30%" cy="30%" r="80%" fx="25%" fy="25%">
          <stop offset="0%" style="stop-color:${colors.ground[0]};stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:${colors.sky[2]};stop-opacity:0" />
        </radialGradient>

        <radialGradient id="radialBlend2" cx="70%" cy="70%" r="80%" fx="75%" fy="75%">
          <stop offset="0%" style="stop-color:${colors.effects[0]};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${colors.sky[1]};stop-opacity:0" />
        </radialGradient>

        <!-- ぼんやりとしたベースパターン -->
        <pattern id="softPattern" x="0" y="0" width="200%" height="200%" patternUnits="userSpaceOnUse">
          <circle cx="50%" cy="50%" r="100%" fill="url(#softGradient1)" />
          <circle cx="0%" cy="0%" r="100%" fill="url(#softGradient2)" />
          <circle cx="100%" cy="100%" r="100%" fill="url(#softGradient3)" />
        </pattern>
      </defs>

      <!-- ベースカラー -->
      <rect x="0" y="0" width="100%" height="100%" fill="${colors.sky[0]}" opacity="0.1" />

      <!-- 大きな円形グラデーション -->
      <circle cx="40%" cy="40%" r="120%" fill="url(#radialBlend1)" opacity="0.7" />
      <circle cx="60%" cy="60%" r="120%" fill="url(#radialBlend2)" opacity="0.7" />
      <circle cx="50%" cy="30%" r="90%" fill="url(#softGradient1)" opacity="0.5" />
      <circle cx="30%" cy="70%" r="90%" fill="url(#softGradient2)" opacity="0.5" />
      <circle cx="70%" cy="40%" r="100%" fill="url(#softGradient3)" opacity="0.4" />

      <!-- ソフトパターンオーバーレイ -->
      <rect x="-50%" y="-50%" width="200%" height="200%" fill="url(#softPattern)" opacity="0.3" />

      <!-- 追加の柔らかいレイヤー -->
      <ellipse cx="50%" cy="50%" rx="100%" ry="90%" fill="url(#radialBlend1)" opacity="0.2" />
      <ellipse cx="50%" cy="50%" rx="90%" ry="100%" fill="url(#radialBlend2)" opacity="0.2" />

      <!-- より大きな円でエッジをぼかす -->
      <circle cx="0" cy="0" r="120%" fill="url(#softGradient1)" opacity="0.2" />
      <circle cx="100%" cy="100%" r="120%" fill="url(#softGradient2)" opacity="0.2" />
      <circle cx="0" cy="100%" r="120%" fill="url(#softGradient3)" opacity="0.2" />
      <circle cx="100%" cy="0" r="120%" fill="url(#softGradient1)" opacity="0.2" />
    </svg>
  `;
  
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}