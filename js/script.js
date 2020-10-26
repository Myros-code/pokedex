const pokemonCards = document.querySelector('.pokemon-cards');
const loadBtn = document.querySelector('.load-btn');
const pokenator = document.querySelector('.pokenator');
const pokeStats = document.querySelectorAll('.stat');
const pokeStatValues = document.querySelectorAll('.stat-value');
const pokeWeightValue = document.querySelector('#pokeWeightValue');
const pokeMovesValue = document.querySelector('#pokeMovesValue');
const ChoosePokeName = document.querySelector('.pokemon-name__item');
const pokenatorImg = document.querySelector('#pokenator_img-item');
const proxy = 'https://cors-anywhere.herokuapp.com/';

// ------------------------------ create class PokeApi -------------------------------
class PokeApi {
    // ------------------------------ create constructor -------------------------------
    constructor() {
        this.CHUNKLOAD = 12;
        this.POKE_CHUNK = `${proxy}http://pokeapi.co/api/v1/pokemon/?limit=`;
        this.SERVER = `${proxy}https://pokeapi.co/api/v1`;
        this.ABILITIES = `${proxy}https://pokeapi.co/api/v1/type/?limit=999`;
        this.POKE_INFO = `${proxy}https://pokeapi.co/api/v1/pokemon`;
        this.POKE_COLOR = `${proxy}https://pokeapi.co/api/v2/pokemon-color`;
        this.ABILITY = `${proxy}https://pokeapi.co/api/v2/ability/`;
        this.POKE_IMG = `https://assets.pokemon.com/assets/cms2/img/pokedex/full`;
    }


    getData = async (url) => {

        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Не удалось получить данные по адресу ${url}`)
        }
    }

    getChunk = (сhuncload) => {
        return this.getData(`${this.POKE_CHUNK}${this.CHUNKLOAD}`);
        console.log('this.getData(`${this.POKE_CHUNK}`)');
    }

    getPokeInfo = (id) => this.getData(`${this.POKE_INFO}/${id}`);

    getAbility = (name) => this.getData(`${this.ABILITY}${name}/`);

    getPokeColor = (id) => this.getData(`${this.POKE_COLOR}/${id%20}`);

    getPokeImg = (id) => this.getData(`${this.POKE_IMG}/${id}.png`);

}

const pokeapi = new PokeApi();


const renderCard = (response) => {
    response.results.forEach((item, id) => {
        const {
            name,
            url,
        } = item;

        let card = document.createElement('div');
        card.className = 'pokemon-card';
        card.id = id + 1;
        let idImg = '000';
        idImg = idImg + card.id;
        idImg = idImg.slice(card.id.length);
        card.innerHTML = `
        <a href="#" class="pokemon-card__link">
            <div class="pokemon-img__block">
                 <img src="${pokeapi.POKE_IMG}/${idImg}.png" alt="Its a pokemon img" class="pokemon-img__item"> 
            </div>
            <div class="pokemon-name__block" id="poke_${id}">
                <span class="pokemon-name__item">${name}</span>
            </div>
            <div class="pokemon-abilities__block">
            </div>
        </a> 
        `;

        pokemonCards.append(card);
        pokeapi.getPokeInfo(card.id).then((response) => {
            let pokeAbilities = card.querySelector('.pokemon-abilities__block');
            response.abilities.forEach((abl, count) => {

                let abilityItem = document.createElement('span');
                abilityItem.className = 'pokemon-ability__item';
                abilityItem.innerHTML = response.abilities[count].ability.name;
                pokeAbilities.append(abilityItem);

                const renderAbilityColor = (responseAbility) => {
                    let colorId = responseAbility.id % 10;

                    if (colorId == 0) {
                        colorId = 2;
                    }

                    const renderColor = (responseColor) => {
                        abilityItem.style.backgroundColor = responseColor.name;
                        abilityItem.style.color = 'black';

                        if (responseColor.name == 'black') {
                            abilityItem.style.color = 'white';
                        } else if (responseColor.name == 'white') {
                            abilityItem.style.border = '1px solid black';
                        };
                    }

                    pokeapi.getPokeColor(colorId).then((responseColor) => renderColor(responseColor));
                }

                pokeapi.getAbility(response.abilities[count].ability.name).then((responseAbility) => renderAbilityColor(responseAbility));
            });


        });

    });

}

pokeapi.getChunk().then((response) => renderCard(response));

pokemonCards.addEventListener('click', (event) => {

    event.preventDefault();
    const target = event.target;
    const card = target.closest('.pokemon-card');

    if (card) {
        let pokeImg = card.querySelector('.pokemon-img__item');
        let getsrc = pokeImg.getAttribute('src');
        pokenatorImg.src = getsrc;
        typeValue.textContent = '';
        pokenator.classList.remove('hidden');

        pokeapi.getPokeInfo(card.id).then((response) => {

            response.stats.forEach((item, id) => {
                pokeStats[id].textContent = item.stat.name;
                pokeStatValues[id].textContent = item.base_stat;

            });

            response.types.forEach((item, id) => {

                typeValue.innerHTML += `${item.type.name}<br>`;

            });

            let idHolder = '000';
            idHolder = idHolder + card.id;
            idHolder = idHolder.slice(card.id.length);
            ChoosePokeName.innerHTML = `${response.name}<br>#${idHolder}`;
            pokeWeightValue.textContent = response.weight;
            pokeMovesValue.textContent = response.moves.length;
        });

    }

});

loadBtn.addEventListener('click', () => {
    pokeapi.CHUNKLOAD += pokeapi.CHUNKLOAD;
    pokemonCards.innerHTML = '';
    pokeapi.getChunk(pokeapi.CHUNKLOAD).then((response) => renderCard(response));
});
