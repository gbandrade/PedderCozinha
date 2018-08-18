Pedidos = new Mongo.Collection("pedidos");
Usuarios = new Mongo.Collection("usuarios");
Produto = new Mongo.Collection("produtos");

Meteor.methods({
    aceitarPedido: function(id, tempoEstimado, pushToken) {
        Pedidos.update(id, {
            $set: {
                status: 'Aceito'
            }
        });

        Pedidos.update(id, {
            $set: {
                tempoEstimado: tempoEstimado
            }
        });

        Pedidos.update(id, {
            $set: {
                dataUltimaAtualizacao: new Date()
            }
        });

        $.ajax({
            url: "https://api.pushbots.com/push/one",
            type: "POST",
            crossDomain: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'x-pushbots-appid': '5ae2632e1db2dc0baa09c7a3',
                'x-pushbots-secret': 'c27af866411e2fde0b7a4bff46765bdf',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                "platform": [1],
                "msg": "Pedido aceito! O tempo estimado é de: " + tempoEstimado + " min.",
                "token": pushToken
            }
        });

    },
    recusarPedido: function(id, motivoRecusa, pushToken) {
        Pedidos.update(id, {
            $set: {
                ativo: false
            }
        });

        Pedidos.update(id, {
            $set: {
                status: 'Recusado'
            }
        });

        Pedidos.update(id, {
            $set: {
                motivoRecusa: motivoRecusa
            }
        });

        Pedidos.update(id, {
            $set: {
                dataUltimaAtualizacao: new Date()
            }
        });

        $.ajax({
            url: "https://api.pushbots.com/push/one",
            type: "POST",
            crossDomain: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'x-pushbots-appid': '5ae2632e1db2dc0baa09c7a3',
                'x-pushbots-secret': 'c27af866411e2fde0b7a4bff46765bdf',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                "platform": [1],
                "msg": "Pedido recusado. Favor verificar status do pedido em Meus Pedidos.",
                "token": pushToken
            }
        });

    },
    finalizar: function(id, pushToken) {
        Pedidos.update(id, {
            $set: {
                ativo: false
            }
        });

        Pedidos.update(id, {
            $set: {
                status: 'Finalizado'
            }
        });

        Pedidos.update(id, {
            $set: {
                dataUltimaAtualizacao: new Date()
            }
        });

        $.ajax({
            url: "https://api.pushbots.com/push/one",
            type: "POST",
            crossDomain: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'x-pushbots-appid': '5ae2632e1db2dc0baa09c7a3',
                'x-pushbots-secret': 'c27af866411e2fde0b7a4bff46765bdf',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                "platform": [1],
                "msg": "Pedido finalizado e a caminho!",
                "token": pushToken
            }
        });

    },
    itemCardapio: function(nome, descricao, image, nomeImagem, preco) {
        Produto.insert({
            nome: nome,
            descricao: descricao,
            image: image,
            nomeImagem: nomeImagem,
            preco: preco
        });
    },
    alterarProduto: function(id, nome, descricao, image, nomeImagem, preco) {
        Produto.update({
            _id: id
        }, {
            $set: {
                'nome': nome
            }
        }, function(error, result) {
            if (error) {
                throw new Meteor.Error(500, error.message);
            } else {
                console.log('success')
            }
        });
        Produto.update({
            _id: id
        }, {
            $set: {
                'descricao': descricao
            }
        }, function(error, result) {
            if (error) {
                throw new Meteor.Error(500, error.message);
            } else {
                console.log('success')
            }
        });
        Produto.update({
            _id: id
        }, {
            $set: {
                'image': image
            }
        }, function(error, result) {
            if (error) {
                throw new Meteor.Error(500, error.message);
            } else {
                console.log('success')
            }
        });
        Produto.update({
            _id: id
        }, {
            $set: {
                'nomeImagem': nomeImagem
            }
        }, function(error, result) {
            if (error) {
                throw new Meteor.Error(500, error.message);
            } else {
                console.log('success')
            }
        });
        Produto.update({
            _id: id
        }, {
            $set: {
                'preco': preco
            }
        }, function(error, result) {
            if (error) {
                throw new Meteor.Error(500, error.message);
            } else {
                console.log('success')
            }
        });
    },
    excluirProduto: function(id) {
        Produto.remove(id);
    }
});

if (Meteor.isServer) {

    Meteor.publish("pedidos", function() {
        var pedidos = Pedidos.find({});
        console.log(pedidos);
        return pedidos;
    });

    Meteor.publish("produtos", function() {
        var produtos = Produto.find({});
        console.log(produtos);
        return produtos;
    });

    Meteor.publish("usuarios", function() {
        var usuarios = Usuarios.find({});
        console.log(usuarios);
        return usuarios;
    });

    Picker.route('/novo-pedido', function(params, req, res, next) {

        res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (!params.query.mesa && !params.query.info) {
            res.statusCode = 400;
            res.end('Faltou definir a Mesa.');
        } else if (!params.query.pedido) {
            res.statusCode = 400;
            res.end('Faltou incluir os itens do pedido.');
        } else {

            var pedido = Pedidos.insert({
                mesa: params.query.mesa,
                info: params.query.info,
                itens: params.query.pedido,
                ativo: true,
                status: 'Aguardando Aceite',
                userAgent: req.headers['user-agent'],
                dataUltimaAtualizacao: new Date(),
                createdAt: new Date(),
                pushToken: params.query.userToken,
                userId: params.query.userId,
                preco: params.query.preco
            });

            res.statusCode = 200;
            res.end('Pedido realizado com sucesso!');

        }

    });

    Picker.route('/dados-usuario', function(params, req, res, next) {

        res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');

        var resposta;
        if (!params.query.userId) {
            res.statusCode = 400;
            resposta = [{
                status: "error",
                msg: "O parâmetro userId é obrigatório."
            }];
        } else {
            var usuario = Usuarios.findOne({
                "_id": params.query.userId
            });
            res.statusCode = 200;
            resposta = [{
                status: "sucesso",
                usuario: usuario
            }];
        }
        res.end(JSON.stringify(resposta));
    });

    Picker.route('/lista-pedido', function(params, req, res, next) {

        res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');

        var resposta;
        if (!params.query.userId) {
            res.statusCode = 400;
            resposta = [{
                status: "error",
                msg: "O parâmetro userId é obrigatório."
            }];
        } else {
            var pedidos = Pedidos.find({
                "userId": params.query.userId
            }, {
                sort: {
                    createdAt: -1
                }
            }).fetch();
            res.statusCode = 200;
            resposta = [{
                status: "sucesso",
                pedidos: pedidos
            }];
        }
        res.end(JSON.stringify(resposta));
    });

    var POST = Picker.filter(function(request, response) {
        return request.method == "POST";
    });

    POST.route('/post/novo-produto', function(params, request, response, next) {
        response.end(JSON.stringify(request.body));
    });

    Picker.route('/novo-produto', function(params, req, res, next) {

        res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (!params.query.nome && !params.query.descricao && !params.query.image && !params.query.preco) {
            res.statusCode = 400;
            res.end(JSON.stringify([{
                status: "error",
                msg: "Os campos Nome, descrição, imagem e preço são obrigatórios."
            }]));
        } else {
            console.log("Image: " + params.query.image)

            var produto = Produto.insert({
                nome: params.query.nome,
                descricao: params.query.descricao,
                image: params.query.image,
                preco: params.query.preco,
                userAgent: req.headers['user-agent']
            });

            res.statusCode = 200;
            res.end(JSON.stringify([{
                status: "sucesso"
            }]));
        }

    });

    Picker.route('/produtos', function(params, req, res, next) {

        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');

        var produtos = Produto.find().fetch();
        var resposta;
        resposta = [{
            status: "sucesso",
            produtos: produtos
        }];

        res.end(JSON.stringify(resposta));

    });


    Picker.route('/novo-usuario', function(params, req, res, next) {

        res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (!params.query.nome || !params.query.login || !params.query.senha) {
            res.statusCode = 400;
            res.end(JSON.stringify([{
                status: "error",
                msg: "Todos os campos são obrigatórios."
            }]));
        } else {
            var usuario = Usuarios.insert({
                nome: params.query.nome,
                login: params.query.login,
                senha: params.query.senha,
                ativo: true,
                userAgent: req.headers['user-agent'],
                createdAt: new Date()
            });

            res.statusCode = 200;
            var usuario = Usuarios.findOne({
                "login": params.query.login,
                "senha": params.query.senha
            });
            res.end(JSON.stringify([{
                status: "sucesso",
                usuario: usuario
            }]));
        }

    });

    Picker.route('/loga-usuario', function(params, req, res, next) {

        res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (!params.query.login && !params.query.senha) {
            res.statusCode = 400;
            res.end('É necessário informar login e senha');
        } else {
            res.statusCode = 200;
            var usuario = Usuarios.findOne({
                "login": params.query.login,
                "senha": params.query.senha
            });
            if (usuario)
                var resposta = [{
                    status: "sucesso",
                    usuario: usuario
                }];
            else
                var resposta = [{
                    status: "error",
                    msg: "Login ou senha inválido."
                }];

            res.end(JSON.stringify(resposta));
        }

    });

    Picker.route('/novo-produto', function(params, req, res, next) {

        res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (!params.query.login && !params.query.senha) {
            res.statusCode = 400;
            res.end('É necessário informar login e senha');
        } else {
            res.statusCode = 200;
            var usuario = Usuarios.findOne({
                "login": params.query.login,
                "senha": params.query.senha
            });
            if (usuario)
                var resposta = [{
                    status: "sucesso",
                    usuario: usuario
                }];
            else
                var resposta = [{
                    status: "error",
                    msg: "Login ou senha inválido."
                }];

            res.end(JSON.stringify(resposta));
        }

    });
}

if (Meteor.isClient) {
    Meteor.subscribe("pedidos");
    var produtosHandle = Meteor.subscribe("produtos");
    var usuariosHandle = Meteor.subscribe("usuarios");

    Template.body.helpers({
        pedidos: function() {
            var lastHour = new Date();
            lastHour.setHours(lastHour.getHours() - 1);
            return Pedidos.find({
                "ativo": true,
                "createdAt": {
                    $gt: lastHour
                }
            }, {
                sort: {
                    createdAt: -1
                }
            });
        },
        produtos: function() {
            return Produto.find({}, {
                sort: {
                    createdAt: -1
                }
            });
        },
        usuarios: function() {
            return Usuarios.find({}, {
                sort: {
                    createdAt: -1
                }
            });
        }
    });

    Template.registerHelper('horario', function(date) {
        return (date.getHours() + 100 + '').substr(1) + ':' + (date.getMinutes() + 100 + '').substr(1);
    });

    Template.registerHelper('descricaoFormatada', function(descricao) {
        if (descricao.length > 18) {
            return descricao.substring(0, 20).concat('...');
        } else {
            return descricao;
        }
    });

    Template.registerHelper('totalPedidosPorUsuario', function(idUsuario) {
        return Pedidos.find({
            userId: idUsuario
        }).count();
    });

    Template.registerHelper('totalGastoPorUsuario', function(idUsuario) {
        var sum = 0;
        var cursor = Pedidos.find({
            userId: idUsuario
        });
        cursor.forEach(function(pedido) {
			if (pedido.status === 'Finalizado') {
				sum = sum + parseFloat(pedido.preco.replace(/\./g, '').replace(',', '.'))
			}            
        });
        return sum.toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' });
    });

    Template.registerHelper('isAguardandoAceite', function(pedido) {
        return pedido.status == 'Aguardando Aceite';
    });

    Template.registerHelper('isPedidoAceito', function(pedido) {
        return pedido.status == 'Aceito';
    });
	
    Template.registerHelper('isProdutosReady', function() {
        return produtosHandle && produtosHandle.ready();
    });	
	
    Template.registerHelper('isUsuariosReady', function() {
        return usuariosHandle && usuariosHandle.ready();
    });		

    Template.body.events({
        'submit form.formRecusarPedido': function(e) {
            e.preventDefault();

            var id = $('#idPedidoRecusarPedido').val();

            var motivoRecusa = $(".formRecusarPedido input:checked").val();

            var pushToken = $("#pushTokenRecusarPedido").val();

            Meteor.call("recusarPedido", id, motivoRecusa, pushToken);

            document.querySelector('#dialogRecusarPedido').close();
        },
        'submit form.formAceitarPedido': function(e) {
            e.preventDefault();

            var id = $('#idPedidoAceitarPedido').val();

            var tempoEstimado = $(".formAceitarPedido input:checked").val();

            var pushToken = $("#pushTokenAceitarPedido").val();

            Meteor.call("aceitarPedido", id, tempoEstimado, pushToken);

            document.querySelector('#dialogAceitarPedido').close();
        }
    });

    Template.pedido.events({
        "click .delete": function() {
            Meteor.call("finalizar", this._id, this.pushToken);
        }
    });

    Template.templateAdicionarProduto.events({
        "submit form": function(e, template) {
            e.preventDefault();
            var nome = $('#nome').val();
            var descricao = $('#descricao').val();
            var image = $("#img-upload").attr("src");
            var nomeImagem = $("#uploadBtn").val().replace(/\\/g, '/').replace(/.*\//, '');
            var preco = $('#preco').val();

            var validationMessage = "";
            if (nome == "" || nome == undefined)
                validationMessage += "- O campo Nome é obrigatório.<br>";
            if (descricao == "" || descricao == undefined)
                validationMessage += "- O campo Descrição é obrigatório.<br>";
            if (image == "" || image == undefined)
                validationMessage += "- O campo Imagem é obrigatório.<br>";
            if (preco == "" || preco == undefined)
                validationMessage += "- O campo Preço é obrigatório.<br>";

            var snackbarContainer = document.querySelector('#demo-toast-example');
            if (validationMessage.length == 0) {
                $('#modalAdicionarProduto').modal('hide');
                Meteor.call("itemCardapio", nome, descricao, image, nomeImagem, preco);
                snackbarContainer.MaterialSnackbar.showSnackbar({
                    message: "Produto cadastrado com sucesso!",
                    timeout: 5000
                });
                $('#nome').val(null);
                $('#nome').removeClass("is-focused");
                $('#descricao').val(null);
                $('#descricao').removeClass("is-focused");
                $('#uploadFile').val(null);
                $('#uploadFile').removeClass("is-focused");
                $("#img-upload").removeAttr("src");
                $("#imagem-container").css("display", "none");
                $('#preco').val(null);
                $('#preco').removeClass("is-focused");
            }
        }
    });

    Template.templateAlterarProduto.events({
        "submit form": function(e, template) {
            e.preventDefault();
            var id = $('#idProduto').val();
            var nome = $('#nome').val();
            var descricao = $('#descricao').val();
            var image = $("#img-upload").attr("src");
			if ($("#uploadBtn").val() != "") {
				var nomeImagem = $("#uploadBtn").val().replace(/\\/g, '/').replace(/.*\//, '');
			} else {
				var nomeImagem = $("#uploadFile").val();
			}            
            var preco = $('#preco').val();

            var validationMessage = "";
            if (nome == "" || nome == undefined)
                validationMessage += "- O campo Nome é obrigatório.<br>";
            if (descricao == "" || descricao == undefined)
                validationMessage += "- O campo Descrição é obrigatório.<br>";
            if (image == "" || image == undefined)
                validationMessage += "- O campo Imagem é obrigatório.<br>";
            if (preco == "" || preco == undefined)
                validationMessage += "- O campo Preço é obrigatório.<br>";

            var snackbarContainer = document.querySelector('#demo-toast-example');
            if (validationMessage.length == 0) {
                $('#modalAlterarProduto').modal('hide');
                Meteor.call("alterarProduto", id, nome, descricao, image, nomeImagem, preco);
                snackbarContainer.MaterialSnackbar.showSnackbar({
                    message: "Produto alterado com sucesso!",
                    timeout: 5000
                });
                $('#nome').val(null);
                $('#nome').removeClass("is-focused");
                $('#descricao').val(null);
                $('#descricao').removeClass("is-focused");
                $('#uploadFile').val(null);
                $('#uploadFile').removeClass("is-focused");
                $("#img-upload").removeAttr("src");
                $("#imagem-container").css("display", "none");
                $('#preco').val(null);
                $('#preco').removeClass("is-focused");
            }
        }
    });

    Template.templateExcluirProduto.events({
        "submit form": function(e, template) {
            e.preventDefault();

            var id = $('#idProduto').val();

            var snackbarContainer = document.querySelector('#demo-toast-example');

            $('#modalExcluirProduto').modal('hide');
            Meteor.call("excluirProduto", id);
            snackbarContainer.MaterialSnackbar.showSnackbar({
                message: "Produto excluido com sucesso!",
                timeout: 5000
            });
        }
    });
}

function shuffle(array) {
    var counter = array.length,
        temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}