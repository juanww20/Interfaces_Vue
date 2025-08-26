
import { defineStore } from 'pinia'

export const useStyleStore = defineStore('style', {
  state: () => ({
    palette: {
      color_one: '#092db0',
      color_two: '#4B97F5',
      color_three: '#AED6F5',
      color_four: '#0D0D2E',
      color_five: '#FFFFFF',
    },
    font: {
      title : 32,
      sub_title: 24,
      paragraph: 16,
      principalFontName : 'Arial',
      secondaryFontName : 'Times New Roman',
    }
  }),
  actions: {
    applyPalette(palette: {colors: {color_one: string, color_two: string, color_three: string, color_four: string, color_five: string}}) {
      this.palette = palette
      const root = document.documentElement.style
      root.setProperty('--primary-color', palette.colors.color_one)
      root.setProperty('--secondary-color', palette.colors.color_two)
      root.setProperty('--tertiary-color', palette.colors.color_three)
      root.setProperty('--dark-color', palette.colors.color_four)
      root.setProperty('--ligth-color', palette.colors.color_five)

      // Guardar en localStorage
      localStorage.setItem('activePalette', JSON.stringify(palette))
    },

    applyFont(font: {
      title: number,
      sub_title: number,
      paragraph: number,
      fontFamily: {
        name_principal: string,
        url_principal: string,
        name_secundary: string,
        url_secundary: string
      },
    }) {
      //console.log('Applying font styles:', font)
      const root = document.documentElement.style;
      // Aplicar tamaños si existen
      if (font.title) {
        this.font.title = font.title;
        root.setProperty('--title-font', `${font.title}px`);
      }
      if (font.sub_title) {
        this.font.sub_title = font.sub_title;
        root.setProperty('--subtitle-font', `${font.sub_title}px`);
      }
      if (font.paragraph) {
        this.font.paragraph = font.paragraph;
        root.setProperty('--text-font', `${font.paragraph}px`);
      }
      // Aplicar familias si existen
      if (font.fontFamily) {
        if (font.fontFamily.name_principal) {
          this.font.principalFontName = font.fontFamily.name_principal;
          root.setProperty('--font-principal', font.fontFamily.name_principal);
        }
        if (font.fontFamily.name_secundary) {
          this.font.secondaryFontName = font.fontFamily.name_secundary;
          root.setProperty('--font-secundaria', font.fontFamily.name_secundary);
        }
      } 

      // Guardar en localStorage
      localStorage.setItem('activeFont', JSON.stringify(font));
    },

    loadPaletteFromStorage() {
      const saved = localStorage.getItem('activePalette')
      if (saved) {
        const palette = JSON.parse(saved)
        this.applyPalette(palette)
      }
    },

    loadFontFromStorage() {
      const saved = localStorage.getItem('activeFont');
      if (saved) {
        const font = JSON.parse(saved);

        // ✅ Inyectar fuentes base64 si existen
        if (font.fontFamily?.url_principal) {
          const fontFace = `@font-face {
            font-family: '${font.fontFamily.name_principal}';
            src: url('${font.fontFamily.url_principal}') format('truetype');
          }`;
          this.addFontStyle(fontFace);
        }

        if (font.fontFamily?.url_secundary) {
          const fontFace = `@font-face {
            font-family: '${font.fontFamily.name_secundary}';
            src: url('${font.fontFamily.url_secundary}') format('truetype');
          }`;
          this.addFontStyle(fontFace);
        }

        this.applyFont(font);
      }
    },

    addFontStyle(css: string) {
      const style = document.createElement('style');
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    }
  }
})
