// Gerador de personagens pixelados
// Tipos removidos - usar JSDoc se necessÃ¡rio

export const SKIN_TONES = [
  '#ffd5b4', // Clara
  '#f4c2a0', // Média clara
  '#e4b899', // Bege
  '#d4a17a', // Média
  '#c89968', // Média escura
  '#b37f5e', // Escura
  '#9a6b4a', // Escura média
  '#8b5a3c', // Escura
  '#7a4b2e', // Muito escura
  '#6b4423', // Muito escura
  '#5a3618', // Profunda
  '#4a280f', // Profunda escura
];

export const HAIR_COLORS = [
  '#2c1b18', // Preto
  '#3d2416', // Preto acastanhado
  '#4a2c1f', // Castanho escuro
  '#5d3a1e', // Castanho médio
  '#8b6239', // Castanho
  '#a67c52', // Castanho claro
  '#d4a574', // Loiro escuro
  '#e6c896', // Loiro
  '#f5e1c2', // Loiro claro
  '#ff8800', // Ruivo
  '#d96b2a', // Ruivo escuro
  '#c0c0c0', // Grisalho
  '#e0e0e0', // Platinado
  '#ff0055', // Rosa
  '#ff00ff', // Magenta
  '#00ffff', // Ciano
  '#00ff41', // Verde
  '#0099ff', // Azul
];

export const EYE_COLORS = [
  '#2c1608', // Castanho escuro
  '#4a3520', // Castanho
  '#6b4d2b', // Castanho claro
  '#4a6741', // Verde
  '#5d8a4f', // Verde claro
  '#2b5f9e', // Azul
  '#4d7abf', // Azul claro
  '#1a3d5c', // Azul escuro
  '#708090', // Cinza
  '#8b8b8b', // Cinza claro
  '#8b008b', // Roxo
  '#00ffff', // Ciano
  '#ff0055', // Vermelho
];

export const OUTFIT_COLORS = [
  '#ff0055', // Vermelho
  '#cc0044', // Vermelho escuro
  '#ff5588', // Rosa
  '#0099ff', // Azul
  '#0066cc', // Azul escuro
  '#00ccff', // Azul claro
  '#00ff41', // Verde
  '#00cc33', // Verde escuro
  '#88ff99', // Verde claro
  '#ffff00', // Amarelo
  '#cccc00', // Amarelo escuro
  '#ff00ff', // Magenta
  '#cc00cc', // Magenta escuro
  '#00ffff', // Ciano
  '#ffffff', // Branco
  '#cccccc', // Cinza claro
  '#888888', // Cinza
  '#444444', // Cinza escuro
  '#000000', // Preto
  '#ff8800', // Laranja
  '#cc6600', // Laranja escuro
  '#8800ff', // Roxo
  '#6600cc', // Roxo escuro
  '#aa00ff', // Roxo claro
];

export const generatePixelArt = (character) => {
  const grid = Array(16).fill(null).map(() => Array(16).fill('transparent'));
  
  // Corpo (roupa)
  for (let y = 8; y < 16; y++) {
    for (let x = 4; x < 12; x++) {
      if (character.outfit === 0) { // Camiseta básica
        grid[y][x] = character.outfitColor;
      } else if (character.outfit === 1) { // Jaqueta
        if (x === 4 || x === 11 || y === 8) {
          grid[y][x] = darkenColor(character.outfitColor);
        } else {
          grid[y][x] = character.outfitColor;
        }
      } else if (character.outfit === 2) { // Armadura
        if ((x + y) % 2 === 0) {
          grid[y][x] = character.outfitColor;
        } else {
          grid[y][x] = darkenColor(character.outfitColor);
        }
      } else if (character.outfit === 3) { // Moletom
        grid[y][x] = character.outfitColor;
        if (y === 8 || y === 9) { // Capuz
          for (let hx = 5; hx < 11; hx++) {
            grid[y - 6][hx] = darkenColor(character.outfitColor);
          }
        }
        if (y > 12 && (x === 5 || x === 10)) { // Bolso canguru
          grid[y][x] = darkenColor(character.outfitColor);
        }
      } else if (character.outfit === 4) { // Capa
        grid[y][x] = character.outfitColor;
        if (y > 8) {
          grid[y][3] = darkenColor(character.outfitColor);
          grid[y][12] = darkenColor(character.outfitColor);
          grid[y][2] = darkenColor(character.outfitColor);
          grid[y][13] = darkenColor(character.outfitColor);
        }
      } else if (character.outfit === 5) { // Colete
        if (x === 4 || x === 11 || x === 5 || x === 10) {
          grid[y][x] = character.outfitColor;
        }
      } else if (character.outfit === 6) { // Regata
        if (x > 4 && x < 11) {
          grid[y][x] = character.outfitColor;
        }
      } else if (character.outfit === 7) { // Terno
        grid[y][x] = character.outfitColor;
        if (x === 7 || x === 8) { // Gravata
          grid[y][x] = darkenColor(character.outfitColor);
        }
        if (y === 8 && (x === 5 || x === 10)) { // Lapela
          grid[y][x] = darkenColor(character.outfitColor);
        }
      } else if (character.outfit === 8) { // Vestido
        grid[y][x] = character.outfitColor;
        if (y > 11) { // Saia mais larga
          if (x === 3) grid[y][x] = character.outfitColor;
          if (x === 12) grid[y][x] = character.outfitColor;
        }
      } else if (character.outfit === 9) { // Kimono
        grid[y][x] = character.outfitColor;
        if (x === 7 || x === 8) { // Faixa central
          grid[y][x] = darkenColor(character.outfitColor);
        }
        if (y === 8) { // Gola
          grid[y][x] = darkenColor(character.outfitColor);
        }
      }
    }
  }
  
  // Braços
  for (let y = 9; y < 14; y++) {
    grid[y][3] = character.skinTone;
    grid[y][12] = character.skinTone;
  }
  
  // Cabeça
  for (let y = 2; y < 8; y++) {
    for (let x = 4; x < 12; x++) {
      grid[y][x] = character.skinTone;
    }
  }
  
  // Cabelo
  if (character.hairStyle === 0) { // Curto
    for (let x = 4; x < 12; x++) {
      grid[2][x] = character.hairColor;
      grid[3][x] = character.hairColor;
    }
  } else if (character.hairStyle === 1) { // Médio
    for (let x = 4; x < 12; x++) {
      grid[2][x] = character.hairColor;
      grid[3][x] = character.hairColor;
      grid[4][x] = character.hairColor;
    }
    grid[4][3] = character.hairColor;
    grid[5][3] = character.hairColor;
    grid[4][12] = character.hairColor;
    grid[5][12] = character.hairColor;
  } else if (character.hairStyle === 2) { // Longo
    for (let x = 4; x < 12; x++) {
      grid[2][x] = character.hairColor;
      grid[3][x] = character.hairColor;
      grid[4][x] = character.hairColor;
    }
    for (let y = 4; y < 9; y++) {
      grid[y][3] = character.hairColor;
      grid[y][12] = character.hairColor;
    }
  } else if (character.hairStyle === 3) { // Moicano
    for (let x = 6; x < 10; x++) {
      grid[1][x] = character.hairColor;
      grid[2][x] = character.hairColor;
      grid[3][x] = character.hairColor;
    }
  } else if (character.hairStyle === 4) { // Careca
    // Sem cabelo
  } else if (character.hairStyle === 5) { // Afro
    for (let x = 3; x < 13; x++) {
      grid[1][x] = character.hairColor;
      grid[2][x] = character.hairColor;
      grid[3][x] = character.hairColor;
    }
    grid[3][2] = character.hairColor;
    grid[3][13] = character.hairColor;
    grid[4][2] = character.hairColor;
    grid[4][13] = character.hairColor;
  } else if (character.hairStyle === 6) { // Rabo de cavalo
    for (let x = 4; x < 12; x++) {
      grid[2][x] = character.hairColor;
      grid[3][x] = character.hairColor;
    }
    for (let y = 4; y < 8; y++) {
      grid[y][7] = character.hairColor;
      grid[y][8] = character.hairColor;
    }
  } else if (character.hairStyle === 7) { // Topete
    for (let x = 4; x < 12; x++) {
      grid[3][x] = character.hairColor;
    }
    for (let x = 5; x < 11; x++) {
      grid[1][x] = character.hairColor;
      grid[2][x] = character.hairColor;
    }
  } else if (character.hairStyle === 8) { // Franja
    for (let x = 4; x < 12; x++) {
      grid[2][x] = character.hairColor;
      grid[3][x] = character.hairColor;
      grid[4][x] = character.hairColor;
    }
  }
  
  // Olhos
  grid[5][6] = character.eyeColor;
  grid[5][9] = character.eyeColor;
  
  // Boca (sorriso)
  grid[6][6] = darkenColor(character.skinTone);
  grid[6][9] = darkenColor(character.skinTone);
  grid[7][7] = darkenColor(character.skinTone);
  grid[7][8] = darkenColor(character.skinTone);
  
  // Acessórios
  if (character.accessory === 1) { // Óculos
    grid[5][5] = '#000000';
    grid[5][6] = '#000000';
    grid[5][7] = '#000000';
    grid[5][8] = '#000000';
    grid[5][9] = '#000000';
    grid[5][10] = '#000000';
  } else if (character.accessory === 2) { // Chapéu
    for (let x = 3; x < 13; x++) {
      grid[1][x] = '#ff0000';
    }
    for (let x = 4; x < 12; x++) {
      grid[0][x] = '#ff0000';
    }
  } else if (character.accessory === 3) { // Cicatriz
    grid[4][10] = '#ff0000';
    grid[5][10] = '#ff0000';
    grid[6][10] = '#ff0000';
  } else if (character.accessory === 4) { // Brinco
    grid[6][3] = '#ffff00';
    grid[6][12] = '#ffff00';
  } else if (character.accessory === 5) { // Máscara
    for (let x = 5; x < 11; x++) {
      grid[5][x] = '#000000';
      grid[6][x] = '#000000';
    }
  } else if (character.accessory === 6) { // Bandana
    for (let x = 4; x < 12; x++) {
      grid[4][x] = '#ff0000';
    }
  } else if (character.accessory === 7) { // Piercing
    grid[7][6] = '#c0c0c0';
    grid[7][9] = '#c0c0c0';
  }
  
  return grid;
};

const darkenColor = (color) => {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const serializeCharacter = (character) => {
  return JSON.stringify(character);
};

export const deserializeCharacter = (data) => {
  return JSON.parse(data);
};
