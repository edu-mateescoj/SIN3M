# 08 - Markdown to pdf
## Plusieurs possibilités

### Export natif
Possibilité de le gérer avec des snippets .CSS
(déjà fait par le passé)
### Pandoc
Suppose dans tous les cas une installation LaTeX
- [article de blog](https://lornajane.net/posts/2023/generating-a-nice-looking-pdf-with-pandoc) (eisvogel)  : bien
- https://github.com/Wandmalfarbe/pandoc-latex-template
`pandoc --version`
`which pandoc`
- https://pandoc-templates.org/
(testé, pas réussi)
### Plugin Obsidian
- Advanced PDF export, avec plusieurs templates intégrés (validé)
### Plugin depuis VSCode
- installé, à tester
### Typst
- demander à notre Nathan national
- https://neilzone.co.uk/2025/01/using-pandoc-and-typst-to-convert-markdown-into-custom-formatted-pdfs-with-a-sample-template/
- https://ipetkov.dev/blog/markdown-to-pdf-pipeline/
- point de départ ici : https://imaginarytext.ca/posts/2024/pandoc-typst-tutorial/
## Markdown to pdf
- Nouveau plugin : **advanced pdf export** (cool, mais pas de customisation et blocs de code en italique)
- https://taonaw.com/2026/02/01/org-files-to-beatiful-docx.html : bien avancé, mais le fichier de style pandoc vasouille (headings qui sautent)
- Enhancing export : réussi à ajouter le support de pdflatex, mais trop compliqué.
- Mon template CSS de l’époque (avec media print) : banal, plus indentation des débuts de paragraphe.
## Sources : 
- https://forum.obsidian.md/t/generate-custom-pdfs-with-pandoc-panrun-and-the-eisvogel-latex-template/22237 : avec panrun, compliqué
- [article de blog](https://lornajane.net/posts/2023/generating-a-nice-looking-pdf-with-pandoc) (eisvogel)  : bien
- [vidéo YT](https://youtu.be/-S8-a_YS6tc?is=s_dqRrYpzQhB-k7S)

### Sources : 

- https://medium.com/better-humans/obsidian-tutorial-for-academic-writing-87b038060522
- https://gist.github.com/ilessing/7ff705de0f594510e463146762cef779 (installation de pdflatex)
- https://community.obsidian.md/plugins/advanced-pdf-export