---
permalink: "/index.html"
---


# Example website!

Browse our posts:
<ul>
{%- for post in collections.posts -%}
  <li><a href="{{ post.url }}">{{ post.data.title }}</a></li>
{%- endfor -%}
</ul>


[Admin page](/admin)
