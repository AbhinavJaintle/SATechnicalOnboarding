const template = document.createElement('template');

template.innerHTML = `
<style>
  /* CSS styles for the carousel container */
  .medium-blogpost-carousel {
    width: 100%;
  }

  /* CSS styles for each carousel item */
  .medium-blogpost-carousel-item {
    width: 1000px;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(131, 131, 131, 0.2);
    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
    border-radius: 8px;
    padding: 10px;
    margin: 0 10px;
  }

  .medium-blogpost-carousel-item img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .medium-blogpost-carousel-item h3 {
    margin: 0;
    font-size: 20px;
  }

  .medium-blogpost-carousel-item p {
    margin: 0;
    font-size: 12px;
    color: rgba(68, 68, 68, 0.8);
  }

  .medium-follow-button {
    margin-top: 5px;
    border: none;
    outline: none;
    background: none;
    color: rgba(3, 168, 124, 1);
    border: solid rgba(3, 168, 124, 1) 1px;
    border-radius: 4px;
    cursor: pointer;
  }

  .medium-blogpost-author {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid rgba(131, 131, 131, 0.2);
  }

  .medium-blogpost-author-img img {
    width: 80px;
    border-radius: 50%;
    margin: 10px;
  }

  .medium-blogpost-author-info h3 {
    margin: 0;
    font-size: 20px;
  }

  .medium-blogpost-author-info p {
    margin: 0;
    font-size: 12px;
    color: rgba(68, 68, 68, 0.8);
  }

  /* Media Query for screens smaller than 768px */
  @media (max-width: 767px) {
    .medium-blogpost-carousel-item {
      width: 100%;
      margin: 0 10px;
    }
  }
</style>

<div class="medium-blogpost-author">
  <div class="medium-blogpost-author-img">
    
  </div>
  <div class="medium-blogpost-author-info">
    
  </div>
</div>
<div class="medium-blogpost-carousel">
  <!-- Carousel items will be dynamically inserted here -->
</div>
`;

class MediumBlogpost extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  async fetchPosts(username) {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${username}`);
    const data = await response.json();
    return data;
  }

  connectedCallback() {
    this.username = this.getAttribute("username");
    this.render();
  }

  renderUser(data) {
    this._shadowRoot.querySelector(
        '.medium-blogpost-author-img'
      ).innerHTML = `<img src="${data.feed.image}" alt="${data.feed.title}" />`;
      this._shadowRoot.querySelector(
        '.medium-blogpost-author-info'
      ).innerHTML = `
        <h3>${data.items[0].author}</h3>
        <p>@${this.username}</p>
        <button class="medium-follow-button">Follow</button>
      `;
  }

  renderArticles(data = []) {
    const carouselContainer = this._shadowRoot.querySelector('.medium-blogpost-carousel');

    data.forEach(data => {
      const carouselItem = document.createElement('div');
      carouselItem.classList.add('medium-blogpost-carousel-item');
      carouselItem.innerHTML = `
        <img src="${data.thumbnail}" alt="${data.title}">
        <h3>${data.title}</h3>
        <p>${this.parseDate(data.pubDate)}</p>
      `;
      carouselContainer.appendChild(carouselItem);
    });

    // Initialize the Slick Carousel
    $(carouselContainer).slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      prevArrow: '<button type="button" class="slick-prev">Previous</button>',
      nextArrow: '<button type="button" class="slick-next">Next</button>'
    });
  }

  parseDate(date) {
    const IsoStringToDate = new Date(date);
    const parsedDate = IsoStringToDate.toUTCString().slice(5).slice(0, -13);
    return parsedDate;
  }

  async render() {
    const data = await this.fetchPosts(this.username);
    this.renderUser(data);
    this.renderArticles(data.items);
  }
}

customElements.define('medium-blogpost', MediumBlogpost);
