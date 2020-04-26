---
title: Cankut's Tech Blog
---

April 25, 2020
## Adding MathJax support to your GitHub Page

#### 1. Configure Markdown processor in _config.yml
```yml
markdown: kramdown
```

#### 2. Reference MathJax 2.x scripts and configure in your layout
```html
<script type="text/x-mathjax-config">
         MathJax.Hub.Config({
           tex2jax: {
             inlineMath: [ ['$','$'], ["\\(","\\)"] ],
             processEscapes: true
           }
         });
       </script>
<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
```

```json
{{ site.github }}
```

#### 3. Include your mathematical expression between `$$` ... `$$`

| Raw LaTex Expression         |    Rendered Version          |
|----------------------------- | -----------------------------|
| ```$$ e^{i\pi} + 1 = 0 $$```       |   $$ e^{i\pi} + 1 = 0 $$     |

<br/>
<br/>
<br/>
<hr/>

April 24, 2020
## GitHub Pages Rocks!

Finally, I've decided to put my work & thoughts on Github Pages.  No hassle, free of charge environment. No server management, no html/css mumbo-jumbo. A little bit Jekyll and Markdown, then you're good to go. 

> *Content > Style*


If you're not OK with ready to use templates, you can always customize! Check this out: [Customizing your themes html layout](https://help.github.com/en/github/working-with-github-pages/adding-a-theme-to-your-github-pages-site-using-jekyll#customizing-your-themes-html-layout)

I'll monkey around to get used into here and share my notes as I learn more. :tada:

<br/>
<br/>
<br/>

