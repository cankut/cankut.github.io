---
title: Cankut's Tech Blog
---

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

#### 3. Include your mathematical expression between `$$` ... `$$`

| Raw LaTex Expression         |    Rendered Version          |
|----------------------------- | -----------------------------|
| ```$$ e^{i\pi} + 1 = 0 $$```       |   $$ e^{i\pi} + 1 = 0 $$     |

<br/>
<br/>
<br/>
<br/>

## GitHub Pages Rocks!

Finally, I've decided to put my work & thoughts on Github Pages.  No hassle, free of charge environment. No server management, no html/css mumbo-jumbo. A little bit Jekyll and Markdown, then you're good to go. 

> *Content > Style*


If you're not OK with ready to use templates, you can always customize! Check this out: [Customizing your themes html layout](https://help.github.com/en/github/working-with-github-pages/adding-a-theme-to-your-github-pages-site-using-jekyll#customizing-your-themes-html-layout)

I'll monkey around to get used into here and share my notes as I learn more. :tada:

<br/>
<br/>
<br/>
<br/>

## Welcome to GitHub Pages

You can use the [editor on GitHub](https://github.com/cankut/cankut.github.io/edit/master/index.md) to maintain and preview the content for your website in Markdown files.

Whenever you commit to this repository, GitHub Pages will run [Jekyll](https://jekyllrb.com/) to rebuild the pages in your site, from the content in your Markdown files.

### Markdown

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/cankut/cankut.github.io/settings). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://help.github.com/categories/github-pages-basics/) or [contact support](https://github.com/contact) and we’ll help you sort it out.
