<h1 align="center">
  <br>
  <img src="example.png" alt="Global News Logo">
  <br>
  <br>
    Global News
  <br>
</h1>

<p align="center">
<a href="https://github.com/ajr-dev/global-news/fork" target="blank">
<img src="https://img.shields.io/github/forks/ajr-dev/global-news?style=for-the-badge" alt="global-news forks"/>
</a>
<a href="https://github.com/ajr-dev/global-news/stargazers" target="blank">
<img src="https://img.shields.io/github/stars/ajr-dev/global-news?style=for-the-badge" alt="global-news stars"/>
</a>
<a href="https://github.com/ajr-dev/global-news/pulls" target="blank">
<img src="https://img.shields.io/github/issues-pr/ajr-dev/global-news?style=for-the-badge" alt="global-news pull-requests"/>
</a>
</p>

A modern web application for viewing global news with an interactive globe visualization.

## 🚀 Features

- Interactive 3D globe visualization
- Latest trending news
- [RSS news sources](https://github.com/yavuz/news-feed-list-of-countries) translated with [libretranslate](https://github.com/LibreTranslate/LibreTranslate)
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- [libretranslate](https://github.com/LibreTranslate/LibreTranslate) up and running

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ajr-dev/global-news.git
cd global-news
npm install
```

2. Rename `.env.example` to `.env` and change the locale to any [libretranslate supported](https://github.com/LibreTranslate/LibreTranslate/tree/main/libretranslate/locales). Default is `en` for English. Development is focused on only `en`.

3. Run the project:
```bash
npm run dev
```

## Tech Stack

- **Next.js**: A React framework for server-side rendering and generating static websites.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Three.js**: A JavaScript library for creating 3D graphics.

## Citation

If you utilize this repository, data in a downstream project, please consider citing it with:

```
@misc{global-news,
  author = {AJR},
  title = {A modern web application for viewing global news with an interactive globe visualization.},
  year = {2025},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/ajr-dev/global-news}},
```

## 🌟 Star history

[![Global News Star history Chart](https://api.star-history.com/svg?repos=ajr-dev/global-news&type=Date)](https://star-history.com/#ajr-dev/global-news&Date)

## License

[Apache License 2.0](LICENSE)

## 🤗 Contributors

This is a community project, a special thanks to our contributors! 🤗

<a href="https://github.com/ajr-dev/global-news/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ajr-dev/global-news" />
</a>
