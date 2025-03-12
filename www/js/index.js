document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Cordova is ready");


    cordova.plugin.http.setDataSerializer('json');

    document.getElementById("btnNovo").addEventListener("click", function () {
        alternarPagina("cadastro");
    });
    document.getElementById("btnFoto").addEventListener("click", function () {
        tirarFoto();
    });
    document.getElementById("btnSalvar").addEventListener("click", function () {
        cadastrarPizza();
    });
    document.getElementById("btnExcluir").addEventListener("click", function () {
        excluirPizza();
    });
    document.getElementById("btnCancelar").addEventListener("click", function () {
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

document.addEventListener("btnNovo", function () {
    console.log("Novo");
    alternarPagina("cadastro");

});

let listaPizzasCadastradas = [];

function carregarPizzas() {
    const PIZZARIA_ID = "pizzaria_do_ze";
    const url = `https://pedidos-pizzaria.glitch.me/admin/pizzas/${PIZZARIA_ID}`;

    cordova.plugin.http.get(url, {}, {}, function (response) {
        if (response.data !== "") {
            listaPizzasCadastradas = JSON.parse(response.data);
        }
        atualizarLista();
    }, function (error) {
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
            carregarDadosPizza(novo.id);
        };
        listaPizzas.appendChild(novo);
    });
}

function carregarDadosPizza(id) {
    const pizzaData = listaPizzasCadastradas[id];
    document.getElementById("imagem").style.backgroundImage = pizzaData.imagem;
    document.getElementById("pizza").value = pizzaData.pizza;
    document.getElementById("preco").value = pizzaData.preco;

    document.getElementById("applista").style.display = "none";
    document.getElementById("appcadastro").style.display = "flex";
}

function cadastrarPizza() {
    const PIZZARIA_ID = "pizzaria_do_ze";
    const pizza = document.getElementById("pizza").value;
    const preco = document.getElementById("preco").value;
    const imagem = document.getElementById("imagem").style.backgroundImage;
    let imageBase64 = "";
    toDataURL(
        imagem,
        function (dataUrl) {
            console.log('RESULT:', dataUrl)
            imageBase64 = dataUrl;
        }
    )
    const url = "https://pedidos-pizzaria.glitch.me/admin/pizza/";
    const dados = { pizzaria: PIZZARIA_ID, pizza, preco, imagem };

    console.log("Dados a serem enviados:", dados);

    cordova.plugin.http.post(url, dados, {}, function (response) {
        console.log("Pizza cadastrada!", response);
        carregarPizzas();
        cancelarCadastro();
    }, function (error) {

        console.error("Erro ao cadastrar pizza", error);
    });

}

function excluirPizza() {
    const PIZZARIA_ID = "pizzaria_do_ze";
    const pizza = document.getElementById("pizza").value;
    const url = `https://pedidos-pizzaria.glitch.me/admin/pizza/${PIZZARIA_ID}/${pizza}`;

    cordova.plugin.http.delete(url, {}, {}, function (response) {
        console.log("Pizza excluída!", response);
        carregarPizzas();
        cancelarCadastro();
    }, function (error) {
        console.error("Erro ao excluir pizza", error);
    });
}

function tirarFoto() {
    navigator.camera.getPicture(
        function (imageData) {
            document.getElementById("imagem").style.backgroundImage = `url(data:image/jpeg;base64,${imageData})`;
        },
        function (error) {
            console.error("Erro ao capturar foto", error);
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
}

function toDataURL(src, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }
}


