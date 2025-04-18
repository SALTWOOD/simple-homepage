class PersonCard extends HTMLElement {
    static get observedAttributes() {
        return ['avatar', 'name', 'description1', 'description2', 'link'];
    }

    constructor() {
        super();
        this._attributes = {
            avatar: '',
            name: '',
            description1: '',
            description2: '',
            link: ''
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

        const link = attrs.link ? `
        <a href="${attrs.link}" 
           target="_blank" 
           style="float:right; margin-right: 10px; margin-left: auto;" 
           rel="nofollow noopener" aria-label="点击访问该站点">
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

const version = "1.0.1";
const tip = String.raw`
    __  __                                                         
   / / / / ____    ____ ___    ___    ____    ____ _  ____ _  ___  
  / /_/ / / __ \  / __ '__ \  / _ \  / __ \  / __ '/ / __ '/ / _ \ 
 / __  / / /_/ / / / / / / / /  __/ / /_/ / / /_/ / / /_/ / /  __/ 
/_/ /_/  \____/ /_/ /_/ /_/  \___/ / .___/  \__,_/  \__, /  \___/  
                                  /_/              /____/          
            Version ${version} | Created by SALTWOOD               
            Repository: https://github.com/SALTWOOD/simple-homepage
            This project follows the MIT license.                  `;

console.log(tip);
document.getElementById("homepage-project-version").textContent = version;