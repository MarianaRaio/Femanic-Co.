import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from "../../context/CartContext";
import "../../styles/carrinho.css";
import { useState } from "react";

const Carrinho = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeOneFromCart, removeFromCart, clearCart } = useCart();

const location = useLocation();
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, [location.pathname]);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0); 

  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    bairro: "",
    complemento: "",
    estado: "",
    cidade: "",
  });

const [salvando, setSalvando] = useState(false);

  const salvarEndereco = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const response = await fetch("http://localhost:3001/api/endereco",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endereco),
      });

      if (response.ok) {
        alert("Endereço salvo com sucesso!");
      } else {
        alert("Erro ao salvar endereço.");
      }
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      alert("Erro na comunicação com o servidor.");
    } finally {
      setSalvando(false); 
    } 
  };

  const handlePayment = async () => {
  if (cartItems.length === 0) {
    alert('Adicione produtos no carrinho para prosseguir!');
    navigate('/produtos');
    return;
  }

  const camposObrigatorios = [
    endereco.rua, endereco.numero, endereco.bairro,
    endereco.complemento, endereco.estado, endereco.cidade,
  ];

  const enderecoPreenchido = camposObrigatorios.every((campo) => campo.trim() !== "");
  if (!enderecoPreenchido) {
    alert('Preencha todos os campos do endereço antes de prosseguir para o pagamento.');
    return;
  }

  const dadosCarrinho = {
    endereco,
    produtos: cartItems.map((item) => ({
      nome: item.name,
      preco: item.price,
      quantidade: item.quantity
    }))
  };

  try {
    const carrinhoResponse = await fetch("http://localhost:3001/api/carrinho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosCarrinho),
    });

    if (!carrinhoResponse.ok) {
      throw new Error("Erro ao salvar o carrinho");
    }

    // Salva o endereço 
    await fetch("http://localhost:3001/api/endereco", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(endereco),
    });

    alert('Pagamento realizado e carrinho salvo com sucesso!');
    clearCart();
    setEndereco({
      rua: "", 
      numero: "", 
      bairro: "",
      complemento: "", 
      estado: "", 
      cidade: "",
    });
    
    navigate('/home');

  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    alert("Erro na comunicação com o servidor.");
  }
};

  return (
    <main className="mandatory">
      <div className="sidebar close">
        <div className="logo-details">
          <i className="bx bxs-shopping-bag-alt"></i>
          <span className="logo_name">FEMANIC & CO.</span>
        </div>
        <ul className="nav-links">
          <li><Link to="/home"><span className="link_name">Home</span></Link></li>
          <li>
            <div className="iocn-link">
              <Link to="/produtos">
                <i className="bx bx-collection"></i>
                <span className="link_name">Produtos</span>
              </Link>
            </div>
            <ul className="sub-menu">
              <li><Link to="/conjuntos">Conjuntos</Link></li>
              <li><Link to="/superiores">Superiores</Link></li>
              <li><Link to="/inferiores">Inferiores</Link></li>
            </ul>
          </li>
          <li>
            <Link to="/carrinho">
              <i className="bx bx-cart"></i>
              <span className="link_name">
                Carrinho {totalItems > 0 && <strong>({totalItems})</strong>}
              </span>
            </Link>
            <ul className="sub-menu blank">
              <li><Link className="link_name" to="/carrinho">Carrinho</Link></li>
            </ul>
          </li>
          <li>
            <div className="iocn-link">
              <Link to="/login">
                <i className="bx bx-user"></i>
                <span className="link_name">Conta</span>
              </Link>
            </div>
            <ul className="sub-menu">
              <li><Link to="/Login">Login</Link></li>
              <li><Link to="/cadastro">Cadastro</Link></li>
            </ul>
          </li>
        </ul>
      </div>

        <div className="p-6 bg-gray-100 min-h-screen content">
          <div className="botao-voltar">
            <button onClick={() => navigate("/produtos")} className="botao-voltar">← Voltar</button>
          </div>

          <h2 className="titulo-carrinho">🛒 Carrinho</h2>

          <div className="tabela-carrinho">
            <table className="tabela-produtos">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço</th>
                  <th>Quantidade</th>
                  <th>Subtotal</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>R$ {item.price.toFixed(2)}</td>
                    <td>
                      <div className="quantity-control">
                        <button onClick={() => removeOneFromCart(item.id)} className="quantity-btn" disabled={item.quantity <= 1}>−</button>
                        <span className="quantity-number">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="quantity-btn">+</button>
                      </div>
                    </td>
                    <td>R$ {(item.price * item.quantity).toFixed(2)}</td>
                    <td><button onClick={() => removeFromCart(item.id)} className="remove-btn">Remover</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        
          <div className="endereco-container">
            <div className="endereco-form">
              <h3>Endereço</h3>
              <form onSubmit={salvarEndereco} className="form-grid">
                <div className="form-group">
                  <label>Endereço</label>
                  <input type="text" placeholder="Av. Nova" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Número</label>
                  <input type="text" placeholder="1550" value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Bairro</label>
                  <input type="text" placeholder="Santo Amaro" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Complemento</label>
                  <input type="text" placeholder="Cj 2715" value={endereco.complemento} onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={endereco.estado} onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })} required>
                    <option value="" disabled hidden>Selecione o estado</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cidade</label>
                  <input type="text" placeholder="São Paulo" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} required />
                </div>
                <div className="form-submit">
                  <button type="submit" disabled={salvando}> {salvando ? "Salvando..." : "Salvar Endereço"}</button>
                </div>
              </form>
            
          
              <div className="total-container">
                <h3>Total no carrinho</h3>
                <div>
                  <p>Subtotal: <strong>R$ {total.toFixed(2)}</strong></p>
                  <p>Total: <strong>R$ {total.toFixed(2)}</strong></p>
                <button onClick={handlePayment}>IR PARA O PAGAMENTO</button>
            </div>
          </div>
        </div>
      </div>
  </main>
  )
}

export default Carrinho;