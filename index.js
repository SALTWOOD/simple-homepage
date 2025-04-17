class PersonCard extends HTMLElement {
    static get observedAttributes() {
        return ['avatar', 'name', 'description1', 'description2', 'href'];
    }

    constructor() {
        super();
        this._attributes = {
            avatar: '',
            name: '',
            description1: '',
            description2: '',
            href: ''
        };
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this._attributes[name] = newValue || '';
            this.render();
        }
    }

    _escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    render() {
        const attrs = Object.fromEntries(
            Object.entries(this._attributes).map(([k, v]) => [k, this._escapeHTML(v)])
        );

        const descriptions = [];
        if (attrs.description1) descriptions.push(
            `<span style="font-size: 14px; color: #666;">${attrs.description1}</span><br>`
        );
        if (attrs.description2) descriptions.push(
            `<span style="font-size: 14px; color: #666;">${attrs.description2}</span><br>`
        );

        const link = attrs.href ? `
        <a href="${attrs.href}" 
           target="_blank" 
           style="float:right; margin-right: 10px; margin-left: auto;" 
           rel="nofollow noopener">
          <i class="fa fa-angle-right" style="font-weight: bold; font-size: 34px"></i>
        </a>
      ` : '';

        this.innerHTML = `
  <div class="person-card">
    <div>
      <img src="${attrs.avatar}" alt="用户头像">
      <p>
        <span style="font-size: 20px;">${attrs.name}</span><br>
        ${descriptions.join('\n')}
      </p>
      ${link}
    </div>
  </div>`;
    }
}

customElements.define('person-card', PersonCard);