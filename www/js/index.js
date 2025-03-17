// Variáveis globais
const PIZZARIA_ID = "pizzaria_do_mura";
let listaPizzasCadastradas = [];
let pizzaAtualId = null;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Cordova is ready");
    cordova.plugin.http.setDataSerializer('json');

    document.getElementById("btnNovo").addEventListener("click", () => {
        pizzaAtualId = null;
        alternarPagina("cadastro");
    });
    document.getElementById("btnFoto").addEventListener("click", () => {
        tirarFoto();
    });
    document.getElementById("btnSalvar").addEventListener("click", () => {
        cadastrarPizza();
    });
    document.getElementById("btnExcluir").addEventListener("click", () => {
        excluirPizza();
    });
    document.getElementById("btnCancelar").addEventListener("click", () => {
        cancelarCadastro();
    });

    carregarPizzas();
}

function alternarPagina(pagina) {
    if (pagina === "lista") {
        document.getElementById("applista").style.display = "flex";
        document.getElementById("appcadastro").style.display = "none";
    } else if (pagina === "cadastro") {
        document.getElementById("applista").style.display = "none";
        document.getElementById("appcadastro").style.display = "flex";
    }
}

function carregarPizzas() {
    const url = `https://pedidos-pizzaria.glitch.me/admin/pizzas/${PIZZARIA_ID}`;
    cordova.plugin.http.get(url, {}, {}, function(response) {
        if (response.data !== "") {
            try {
                listaPizzasCadastradas = JSON.parse(response.data);
            } catch (e) {
                console.error("Erro ao parsear dados:", e);
                listaPizzasCadastradas = [];
            }
        } else {
            listaPizzasCadastradas = [];
        }
        atualizarLista();
    }, function(error) {
        console.error("Erro ao carregar pizzas", error);
    });
}

function atualizarLista() {
    const listaPizzas = document.getElementById("listaPizzas");
    listaPizzas.innerHTML = "";
    listaPizzasCadastradas.forEach((item, idx) => {
        const novo = document.createElement("div");
        novo.classList.add("linha");
        novo.innerHTML = item.pizza;
        novo.id = idx;
        novo.onclick = function () {
            carregarDadosPizza(idx);
        };
        listaPizzas.appendChild(novo);
    });
}

function carregarDadosPizza(idx) {
    const pizzaData = listaPizzasCadastradas[idx];
    if (!pizzaData) return;
    pizzaAtualId = pizzaData._id || null;
    document.getElementById("imagem").style.backgroundImage = pizzaData.imagem || "none";
    document.getElementById("pizza").value = pizzaData.pizza || "";
    document.getElementById("preco").value = pizzaData.preco || "";
    alternarPagina("cadastro");
}

function cadastrarPizza() {
    const pizzaInput = document.getElementById("pizza");
    const precoInput = document.getElementById("preco");
    const imagemElem = document.getElementById("imagem");

    if (!imagemElem.style.backgroundImage || imagemElem.style.backgroundImage === "none") {
        alert("Por favor, tire uma foto da pizza antes de cadastrar.");
        return;
    }

    const data = {
        pizzaria: PIZZARIA_ID,
        pizza: pizzaInput.value.trim(),
        preco: precoInput.value.trim(),
        imagem: imagemElem.style.backgroundImage
    };

    const method = pizzaAtualId ? "PUT" : "POST";
    if (pizzaAtualId) {
        data.pizzaid = pizzaAtualId;
    }

    const url = "https://pedidos-pizzaria.glitch.me/admin/pizza/";
    cordova.plugin.http.sendRequest(url, { method: method, data: data }, function(response) {
        alert(pizzaAtualId ? "Pizza atualizada" : "Pizza cadastrada");
        carregarPizzas();
        cancelarCadastro();
    }, function(error) {
        alert("Erro ao salvar a pizza");
        console.error("Erro ao salvar a pizza:", error);
    });
}

function excluirPizza() {
    const pizzaName = document.getElementById("pizza").value.trim();
    if (!pizzaName) {
        alert("Selecione uma pizza para excluir.");
        return;
    }
    const url = `https://pedidos-pizzaria.glitch.me/admin/pizza/${PIZZARIA_ID}/${pizzaName}`;
    cordova.plugin.http.delete(url, {}, {}, function(response) {
        alert("Pizza excluída!");
        carregarPizzas();
        cancelarCadastro();
    }, function(error) {
        alert("Erro ao excluir a pizza");
        console.error("Erro ao excluir a pizza:", error);
    });
}

function tirarFoto() {
    navigator.camera.getPicture(
        function(imageData) {
            if (imageData) {
                document.getElementById("imagem").style.backgroundImage = `url(data:image/jpeg;base64,${imageData})`;
            } else {
                console.error("Nenhuma imagem capturada.");
            }
        },
        function(error) {
            console.error("Erro ao capturar foto:", error);
        },
        {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA
        }
    );
}

function cancelarCadastro() {
    document.getElementById("applista").style.display = "flex";
    document.getElementById("appcadastro").style.display = "none";
    document.getElementById("pizza").value = "";
    document.getElementById("preco").value = "";
    document.getElementById("imagem").style.backgroundImage = "none";
    pizzaAtualId = null;
}
