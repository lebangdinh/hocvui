import React from 'react';

export type GameArtType = 'puzzle' | 'chicken' | 'airplane' | 'racing' | 'tank' | 'memory';

type Props = { type: GameArtType; className?: string };

export const GameSceneArt: React.FC<Props> = ({ type, className = '' }) => {
  const id = 'game-scene-' + type;
  const skies: Record<GameArtType, [string, string]> = {
    puzzle: ['#ffe4a5', '#ff8d8d'],
    chicken: ['#ffe9a1', '#ff9ab6'],
    airplane: ['#70d8fe', '#7d83fd'],
    racing: ['#94f7ce', '#37cda1'],
    tank: ['#c4b5fd', '#7284ef'],
    memory: ['#ffd1e7', '#ab97ff']
  };
  const [sky1, sky2] = skies[type];
  return (
    <svg className={className} viewBox="0 0 480 256" preserveAspectRatio="xMidYMid slice" fill="none" role="img" aria-label={'Hình minh họa trò chơi ' + type} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id + '-sky'} x1="45" y1="0" x2="380" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor={sky1} />
          <stop offset="1" stopColor={sky2} />
        </linearGradient>
        <linearGradient id={id + '-gloss'} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFFFFF" stopOpacity=".94" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity=".35" />
        </linearGradient>
        <filter id={id + '-shadow'} x="-30%" y="-40%" width="160%" height="210%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#293054" floodOpacity=".21" />
        </filter>
      </defs>
      <rect width="480" height="256" rx="28" fill={'url(#' + id + '-sky)'} />
      <circle cx="418" cy="38" r="90" fill="#fff" opacity=".15" />
      <circle cx="39" cy="245" r="100" fill="#fff" opacity=".11" />
      <path d="M-10 210C86 158 158 248 248 213C330 181 397 179 490 215V280H-10V210Z" fill="#fff" opacity=".17" />
      <g fill="#FFFFFF" opacity=".8">
        <circle cx="28" cy="40" r="4"/><circle cx="452" cy="120" r="3"/>
        <circle cx="89" cy="22" r="2.5"/><circle cx="361" cy="35" r="3"/>
        <path d="M417 73v16m-8-8h16" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      </g>
      {type === 'puzzle' && (
        <g filter={'url(#' + id + '-shadow)'}>
          <g transform="rotate(-11 214 124)">
            <rect x="110" y="51" width="112" height="112" rx="23" fill="#FC6B64"/>
            <rect x="115" y="51" width="102" height="100" rx="20" fill="#FFBE74"/>
            <circle cx="166" cy="51" r="17" fill="#FFBE74"/><circle cx="166" cy="51" r="8" fill="#FFDF9F"/>
            <text x="167" y="121" fontSize="56" textAnchor="middle" fill="#9C3B3E" fontWeight="900">1</text>
          </g>
          <g transform="rotate(9 271 145)">
            <rect x="217" y="89" width="116" height="112" rx="22" fill="#3F8CC7"/>
            <rect x="219" y="88" width="108" height="104" rx="20" fill="#75D7FF"/>
            <circle cx="271" cy="88" r="18" fill="#75D7FF"/>
            <text x="271" y="159" fontSize="57" textAnchor="middle" fill="#145F9F" fontWeight="900">2</text>
          </g>
          <g transform="rotate(-5 351 107)">
            <rect x="322" y="42" width="90" height="91" rx="19" fill="#8D60CC"/>
            <rect x="322" y="42" width="85" height="84" rx="18" fill="#CBB4FF"/>
            <text x="363" y="103" fontSize="48" textAnchor="middle" fill="#63439B" fontWeight="900">3</text>
          </g>
          <path d="M88 176l8 13 15 2-11 11 2 15-14-7-13 7 2-15-11-11 15-2 7-13Z" fill="#fff"/>
        </g>
      )}
      {type === 'chicken' && (
        <g filter={'url(#' + id + '-shadow)'}>
          <ellipse cx="235" cy="215" rx="117" ry="17" fill="#DD7584" opacity=".32"/>
          <ellipse cx="240" cy="125" rx="87" ry="79" fill="#F8BD58"/>
          <ellipse cx="227" cy="114" rx="85" ry="78" fill="#FFF1BD"/>
          <ellipse cx="170" cy="146" rx="32" ry="47" fill="#FFE099" transform="rotate(-28 170 146)"/>
          <ellipse cx="307" cy="143" rx="34" ry="43" fill="#FFE099" transform="rotate(28 307 143)"/>
          <path d="M206 48C200 27 217 14 232 33C242 9 260 17 260 37C278 22 292 42 276 57Z" fill="#FA6479"/>
          <ellipse cx="210" cy="116" rx="13" ry="17" fill="#433B4A"/>
          <ellipse cx="265" cy="116" rx="13" ry="17" fill="#433B4A"/>
          <circle cx="214" cy="110" r="5" fill="#fff"/><circle cx="269" cy="110" r="5" fill="#fff"/>
          <ellipse cx="184" cy="145" rx="17" ry="10" fill="#FFA5B1"/>
          <ellipse cx="288" cy="145" rx="17" ry="10" fill="#FFA5B1"/>
          <path d="M223 141l15 12 15-12-15-9-15 9Z" fill="#F28B37"/>
          <path d="M207 191l-11 30m54-30 11 30" stroke="#F28B37" strokeWidth="9" strokeLinecap="round"/>
          <circle cx="98" cy="113" r="26" fill="#fff" opacity=".86"/>
          <circle cx="98" cy="113" r="15" stroke="#FF8395" strokeWidth="6"/>
          <circle cx="98" cy="113" r="4" fill="#FF8395"/>
          <circle cx="381" cy="72" r="19" fill="#fff" opacity=".72"/>
          <path d="M376 71l5 6 9-13" stroke="#61B99B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      )}
      {type === 'airplane' && (
        <g>
          <g fill="#fff" opacity=".78">
            <ellipse cx="107" cy="67" rx="44" ry="15"/><circle cx="88" cy="58" r="23"/><circle cx="118" cy="53" r="28"/>
            <ellipse cx="384" cy="165" rx="54" ry="18"/><circle cx="361" cy="153" r="25"/><circle cx="403" cy="152" r="32"/>
          </g>
          <path d="M167 198C111 194 96 172 83 157" stroke="#FFF" strokeOpacity=".8" strokeWidth="8" strokeLinecap="round" strokeDasharray="3 19"/>
          <g filter={'url(#' + id + '-shadow)'} transform="rotate(19 250 130)">
            <path d="M234 167l-18 66 31-17 17-43Z" fill="#FFD176"/>
            <path d="M269 170l14 61 26-20-19-48Z" fill="#FF8F8D"/>
            <path d="M240 166l6 61 18-29 18 30 4-70Z" fill="#FFD97D"/>
            <path d="M245 165l19 57 17-57Z" fill="#fff"/>
            <path d="M240 148l-87 32 44-68 46-17Z" fill="#5279F7"/>
            <path d="M277 148l84 32-40-68-47-17Z" fill="#395ED9"/>
            <path d="M256 28C218 70 214 117 233 173H281C302 113 292 69 256 28Z" fill="#fff"/>
            <path d="M256 28C233 56 224 84 223 103H290C287 74 272 43 256 28Z" fill="#FF765E"/>
            <ellipse cx="258" cy="111" rx="20" ry="24" fill="#56D8F5" stroke="#31579B" strokeWidth="7"/>
            <path d="M251 100l-8 9" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
          </g>
        </g>
      )}
      {type === 'racing' && (
        <g filter={'url(#' + id + '-shadow)'}>
          <path d="M139 270l72-270h105l77 270Z" fill="#506576"/>
          <path d="M185 270l63-270h29l65 270" stroke="#E1F0E9" strokeWidth="9" strokeDasharray="30 24" opacity=".6"/>
          <path d="M176 266l45-260M356 266L307 6" stroke="#F9F7D3" strokeWidth="7" strokeLinecap="round"/>
          <g transform="translate(183 89) rotate(-10)">
            <rect x="0" y="0" width="139" height="95" rx="38" fill="#E34B3E"/>
            <rect x="4" y="0" width="131" height="81" rx="33" fill="#FF846C"/>
            <rect x="-8" y="15" width="16" height="26" rx="6" fill="#29445F"/>
            <rect x="131" y="15" width="16" height="26" rx="6" fill="#29445F"/>
            <rect x="-8" y="62" width="16" height="26" rx="6" fill="#29445F"/>
            <rect x="131" y="62" width="16" height="26" rx="6" fill="#29445F"/>
            <rect x="27" y="13" width="86" height="38" rx="18" fill="#77DAF4" stroke="#FCE5D6" strokeWidth="6"/>
            <path d="M49 15l-7 32" stroke="#fff" strokeOpacity=".65" strokeWidth="8"/>
            <path d="M24 62h91" stroke="#FFD070" strokeWidth="9" strokeLinecap="round"/>
            <rect x="19" y="79" width="25" height="9" rx="4" fill="#FFF4B8"/>
            <rect x="96" y="79" width="25" height="9" rx="4" fill="#FFF4B8"/>
          </g>
          <path d="M75 166h65M88 189h43M366 54h58M375 81h35" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity=".78"/>
        </g>
      )}
      {type === 'tank' && (
        <g filter={'url(#' + id + '-shadow)'}>
          <ellipse cx="242" cy="218" rx="124" ry="19" fill="#515DA0" opacity=".3"/>
          <rect x="120" y="142" width="243" height="75" rx="31" fill="#5663AF"/>
          <rect x="124" y="143" width="235" height="67" rx="30" fill="#9CA5F8"/>
          <g fill="#47549D"><circle cx="155" cy="185" r="17"/><circle cx="208" cy="185" r="17"/><circle cx="263" cy="185" r="17"/><circle cx="321" cy="185" r="17"/></g>
          <rect x="180" y="78" width="118" height="96" rx="37" fill="#6F81E7"/>
          <rect x="184" y="72" width="110" height="96" rx="35" fill="#E4EAFF"/>
          <rect x="215" y="99" width="56" height="35" rx="15" fill="#48599F"/>
          <circle cx="230" cy="117" r="6" fill="#7FEEEA"/><circle cx="257" cy="117" r="6" fill="#7FEEEA"/>
          <path d="M231 147q16 12 30 0" stroke="#6F81E7" strokeWidth="6" strokeLinecap="round"/>
          <path d="M294 125l70-28" stroke="#E4EAFF" strokeWidth="19" strokeLinecap="round"/>
          <circle cx="376" cy="95" r="15" fill="#FDE68A"/>
          <path d="M376 60v-9m0 88v-9m35-35h8m-87 0h-8" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
          <path d="M188 76l-12-23m99 23 12-23" stroke="#fff" strokeWidth="7" strokeLinecap="round"/>
          <circle cx="175" cy="48" r="9" fill="#FFD470"/><circle cx="288" cy="48" r="9" fill="#FFD470"/>
        </g>
      )}
      {type === 'memory' && (
        <g filter={'url(#' + id + '-shadow)'}>
          {[
            {x:104,y:54,c:'#FF98BA',r:-10},
            {x:193,y:37,c:'#8D7AF0',r:8},
            {x:280,y:63,c:'#77C9EE',r:-5},
            {x:154,y:132,c:'#8FE0C0',r:9},
            {x:259,y:136,c:'#FFD37B',r:-9}
          ].map((card,i)=>
            <g key={i} transform={`rotate(${card.r} ${card.x+43} ${card.y+49})`}>
              <rect x={card.x} y={card.y+6} width="86" height="94" rx="17" fill="#5F578F" opacity=".4"/>
              <rect x={card.x} y={card.y} width="86" height="94" rx="17" fill={card.c} stroke="#fff" strokeWidth="5"/>
              <path d={`M${card.x+20} ${card.y+20}h46v54h-46Z`} stroke="#fff" strokeOpacity=".45" strokeWidth="3" strokeDasharray="5 5"/>
              {i === 0 || i === 4 ? 
                <path d={`M${card.x+43} ${card.y+31}l7 13 14 2-10 10 3 14-14-7-13 7 3-14-10-10 14-2Z`} fill="#fff"/> :
                i === 1 ? <circle cx={card.x+43} cy={card.y+50} r="22" fill="#fff" opacity=".9"/> :
                i === 2 ? <path d={`M${card.x+23} ${card.y+46}q20-30 42 0-22 36-42 0Z`} fill="#fff"/> :
                <path d={`M${card.x+24} ${card.y+48}q19-33 39 0q-21 33-39 0`} stroke="#fff" strokeWidth="8" strokeLinecap="round"/>
              }
            </g>
          )}
          <path d="M77 125l7 10 12-2-5 12 6 10-13-2-8 10-3-13-13-3 12-7 5-15Z" fill="#fff"/>
          <path d="M385 148l6 12 14 1-10 10 3 14-13-6-13 7 3-15-11-10 15-2 6-11Z" fill="#fff"/>
        </g>
      )}
    </svg>
  );
};
