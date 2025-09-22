// Minimal shims so TS can compile without node type packages present

declare module 'jspdf' {
  const jsPDF: any
  export default jsPDF
}

declare module 'svg2pdf.js' {
  const plugin: any
  export default plugin
}
