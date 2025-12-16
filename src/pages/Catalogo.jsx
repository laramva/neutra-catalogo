import { useEffect, useMemo, useState } from "react";
import ProdutoCard from "../components/ProdutoCard";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";

import logo from "../assets/logo.png";

import auricular from "../assets/auricular.png";
import capa from "../assets/capa.png";
import cpu from "../assets/cpu.png";
import fone from "../assets/fone.png";
import microfone from "../assets/microfone.png";
import monitor from "../assets/monitor.png";
import mouse from "../assets/mouse.png";
import mousepad from "../assets/mousepad.png";
import smartwatch from "../assets/smartwatch.png";
import teclado from "../assets/teclado.png";
import webcam from "../assets/webcam.png";

const STORAGE_KEY = "neutra_catalogo_produtos_v3";

const IMAGENS = {
  auricular,
  capa,
  cpu,
  fone,
  microfone,
  monitor,
  mouse,
  mousepad,
  smartwatch,
  teclado,
  webcam,
};

const CATEGORY_IMAGE = {
  Áudio: "fone",
  Setup: "mouse",
  Acessórios: "capa",
  Computação: "cpu",
  Wearables: "smartwatch",
};

const MOCK_PRODUTOS = [
  { id: "p1", nome: "Auricular Nebula", preco: 399, descricao: "Som limpo e confortável para o dia a dia.", categoria: "Áudio", imagemKey: "auricular" },
  { id: "p2", nome: "Capa Prism", preco: 129, descricao: "Proteção discreta com acabamento suave.", categoria: "Acessórios", imagemKey: "capa" },
  { id: "p3", nome: "CPU Core", preco: 2499, descricao: "Desempenho estável para trabalho e criação.", categoria: "Computação", imagemKey: "cpu" },
  { id: "p4", nome: "Headset Auralis", preco: 599, descricao: "Conforto premium e áudio equilibrado.", categoria: "Áudio", imagemKey: "fone" },
  { id: "p5", nome: "Microfone Drift", preco: 449, descricao: "Voz nítida para calls, aulas e gravações.", categoria: "Áudio", imagemKey: "microfone" },
  { id: "p6", nome: "Monitor Void", preco: 1299, descricao: "Tela ampla com visual limpo e elegante.", categoria: "Setup", imagemKey: "monitor" },
  { id: "p7", nome: "Mouse Neutra", preco: 189, descricao: "Precisão e ergonomia para longas sessões.", categoria: "Setup", imagemKey: "mouse" },
  { id: "p8", nome: "Mousepad Aura", preco: 79, descricao: "Controle suave com base antiderrapante.", categoria: "Setup", imagemKey: "mousepad" },
  { id: "p9", nome: "Smartwatch Calm", preco: 899, descricao: "Rotina e notificações com leitura clara.", categoria: "Wearables", imagemKey: "smartwatch" },
  { id: "p10", nome: "Teclado Mono", preco: 329, descricao: "Resposta firme e digitação confortável.", categoria: "Setup", imagemKey: "teclado" },
  { id: "p11", nome: "Webcam Lumen", preco: 299, descricao: "Imagem estável e nítida em qualquer ambiente.", categoria: "Acessórios", imagemKey: "webcam" },
];

function formatBRL(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function uid() {
  return `p_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function ensureImagemKey(prod) {
  if (prod.imagemKey && IMAGENS[prod.imagemKey]) return prod.imagemKey;
  const byCat = CATEGORY_IMAGE[prod.categoria] || "fone";
  return IMAGENS[byCat] ? byCat : "fone";
}

export default function Catalogo() {
  const { push } = useToast();
  const ano = useMemo(() => new Date().getFullYear(), []);

  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState([]);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("relevancia");

  const [form, setForm] = useState({
    nome: "",
    preco: "",
    descricao: "",
    categoria: "Setup",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProdutos(Array.isArray(parsed) ? parsed : MOCK_PRODUTOS);
        } catch {
          setProdutos(MOCK_PRODUTOS);
        }
      } else {
        setProdutos(MOCK_PRODUTOS);
      }
      setLoading(false);
    }, 650);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
  }, [produtos, loading]);

  const produtosView = useMemo(() => {
    const q = normalize(query);

    let list = produtos.filter((p) => {
      const hay = normalize(`${p.nome} ${p.descricao} ${p.categoria}`);
      return hay.includes(q);
    });

    if (sort === "nome") list = [...list].sort((a, b) => a.nome.localeCompare(b.nome));
    if (sort === "precoAsc") list = [...list].sort((a, b) => a.preco - b.preco);
    if (sort === "precoDesc") list = [...list].sort((a, b) => b.preco - a.preco);

    return list;
  }, [produtos, query, sort]);

  function hydrateProduto(p) {
    const imagemKey = ensureImagemKey(p);
    return {
      ...p,
      imagemKey,
      imagem: IMAGENS[imagemKey],
      precoFormatado: formatBRL(Number(p.preco)),
    };
  }

  function onChangeForm(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function validateForm(f) {
    if (!f.nome.trim()) return "Nome é obrigatório.";
    if (!String(f.preco).trim()) return "Preço é obrigatório.";
    const num = Number(String(f.preco).replace(",", "."));
    if (Number.isNaN(num) || num <= 0) return "Preço deve ser um número maior que zero.";
    if (!f.descricao.trim()) return "Descrição é obrigatória.";
    return null;
  }

  function addProduto(e) {
    e.preventDefault();
    const err = validateForm(form);
    if (err) return push(err, "error");

    const precoNum = Number(String(form.preco).replace(",", "."));

    const novo = {
      id: uid(),
      nome: form.nome.trim(),
      preco: precoNum,
      descricao: form.descricao.trim(),
      categoria: form.categoria,
      imagemKey: CATEGORY_IMAGE[form.categoria] || "fone",
    };

    setProdutos((s) => [novo, ...s]);
    setForm({ nome: "", preco: "", descricao: "", categoria: "Setup" });
    push("Produto adicionado.", "success");
    setDrawerOpen(false);
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" });
  }

  function openEdit(p) {
    setCurrent(p);
    setEditOpen(true);
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!current) return;

    const err = validateForm({ nome: current.nome, preco: current.preco, descricao: current.descricao });
    if (err) return push(err, "error");

    const fixed = { ...current, imagemKey: ensureImagemKey(current) };
    setProdutos((s) => s.map((p) => (p.id === fixed.id ? fixed : p)));
    setEditOpen(false);
    setCurrent(null);
    push("Produto atualizado.", "success");
  }

  function openDelete(p) {
    setCurrent(p);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (!current) return;
    setProdutos((s) => s.filter((p) => p.id !== current.id));
    setDeleteOpen(false);
    setCurrent(null);
    push("Produto removido.", "info");
  }

  return (
    <div className="appShell">
      <div className="container">
        <header className="topbar card">
          <div className="brand">
            <img className="brandLogo" src={logo} alt="NEUTRA" />
          </div>

          <nav className="nav">
            <a className="pill" href="#home">Início</a>
            <a className="pill" href="#produtos">Produtos</a>
            <a className="pill" href="#cadastro">Cadastro</a>
          </nav>

          <button className="btn btnPrimary">Solicitar orçamento</button>
        </header>

        <section className="hero card" id="home">
          <div className="heroGrid">
            <div className="heroLeft">
              <div className="kicker">SELEÇÃO</div>
              <h1 className="heroTitle display">PRODUTOS PARA O SEU SETUP</h1>
              <p className="heroText">Curadoria NEUTRA de tecnologia essencial — clean, funcional e premium.</p>

              <div className="heroCtas">
                <a className="btn btnPrimary" href="#produtos">Ver catálogo</a>
                <span className="pill soft">{loading ? "Carregando itens…" : `${produtos.length} itens disponíveis`}</span>
              </div>

              <div className="toolbar">
                <div className="field">
                  <label className="label" htmlFor="q">Buscar</label>
                  <input
                    id="q"
                    className="input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Nome, categoria ou descrição"
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="sort">Ordenar</label>
                  <select
                    id="sort"
                    className="select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="relevancia">Relevância</option>
                    <option value="nome">Nome (A–Z)</option>
                    <option value="precoAsc">Preço (menor)</option>
                    <option value="precoDesc">Preço (maior)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="heroRight">
              <div className="featuredRing" aria-hidden="true">
                <div className="featuredInner">
                  <img className="featuredImg" src={fone} alt="" />
                </div>
              </div>

              <div className="note cardMini">
                <div className="noteTitle">DESTAQUES</div>
                <div className="noteText">Áudio, setup e acessórios — escolha, compare e cadastre novos itens.</div>
              </div>
            </div>
          </div>
        </section>

        <main className="mainGrid" id="produtos">
          <section className="catalog">
            <div className="sectionHead">
              <div className="sectionLeft">
                <h2 className="sectionTitle display">CATÁLOGO</h2>
                <div className="sectionSub">Produtos selecionados com foco em qualidade e experiência.</div>
              </div>

              <div className="sectionRight">
                <span className="pill soft">{loading ? "…" : `${produtosView.length} resultados`}</span>
                <button className="btn btnGhost mobileOnly" onClick={() => setDrawerOpen(true)}>Cadastro</button>
              </div>
            </div>

            
              {loading ? (<div className="grid">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="skeleton" />
                ))}
              </div>
            ) : produtosView.length ? (
              <div className="grid">
                {produtosView.map((p) => {
                  const view = hydrateProduto(p);
                  return (
                    <ProdutoCard
                      key={p.id}
                      produto={view}
                      onEdit={() => openEdit(p)}
                      onDelete={() => openDelete(p)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="empty cardMini">
                <div className="emptyTitle">Nenhum produto encontrado</div>
                <div className="emptyText">Tente outro termo de busca ou limpe o campo.</div>
                <button className="btn btnGhost" onClick={() => setQuery("")}>Limpar busca</button>
              </div>
            )}
          </section>

          <aside className="side card desktopOnly" id="cadastro">
            <div className="kicker">CADASTRO</div>
            <h3 className="sideTitle display">NOVO PRODUTO</h3>

            <form className="form formCompact" onSubmit={addProduto}>
              <div className="field">
                <label className="label" htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  name="nome"
                  className="input"
                  value={form.nome}
                  onChange={onChangeForm}
                  placeholder="Ex: Headset Auralis"
                  required
                />
              </div>

              <div className="row2">
                <div className="field">
                  <label className="label" htmlFor="preco">Preço</label>
                  <input
                    id="preco"
                    name="preco"
                    className="input"
                    value={form.preco}
                    onChange={onChangeForm}
                    placeholder="Ex: 599"
                    required
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="categoria">Categoria</label>
                  <select
                    id="categoria"
                    name="categoria"
                    className="select"
                    value={form.categoria}
                    onChange={onChangeForm}
                  >
                    <option>Áudio</option>
                    <option>Setup</option>
                    <option>Acessórios</option>
                    <option>Computação</option>
                    <option>Wearables</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  className="textarea"
                  value={form.descricao}
                  onChange={onChangeForm}
                  placeholder="Descrição curta e objetiva"
                  required
                  rows={3}
                />
              </div>

              <button className="btn btnPrimary btnBlock" type="submit">Adicionar produto</button>
              <div className="hint">Obrigatórios: nome, preço e descrição.</div>
            </form>
          </aside>
        </main>

        <footer className="footer">
          <span className="pill soft">NEUTRA © {ano}</span>
        </footer>
      </div>

      <Modal open={editOpen} title="Editar produto" onClose={() => setEditOpen(false)}>
        <form className="form" onSubmit={saveEdit}>
          <div className="field">
            <label className="label">Nome</label>
            <input
              className="input"
              value={current?.nome || ""}
              onChange={(e) => setCurrent((s) => ({ ...s, nome: e.target.value }))}
              required
            />
          </div>

          <div className="row2">
            <div className="field">
              <label className="label">Preço</label>
              <input
                className="input"
                value={current?.preco ?? ""}
                onChange={(e) =>
                  setCurrent((s) => ({ ...s, preco: Number(String(e.target.value).replace(",", ".")) }))
                }
                required
              />
            </div>

            <div className="field">
              <label className="label">Categoria</label>
              <select
                className="select"
                value={current?.categoria || "Setup"}
                onChange={(e) => setCurrent((s) => ({ ...s, categoria: e.target.value }))}
              >
                <option>Áudio</option>
                <option>Setup</option>
                <option>Acessórios</option>
                <option>Computação</option>
                <option>Wearables</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="label">Descrição</label>
            <textarea
              className="textarea"
              rows={4}
              value={current?.descricao || ""}
              onChange={(e) => setCurrent((s) => ({ ...s, descricao: e.target.value }))}
              required
            />
          </div>

          <div className="modalActions">
            <button type="button" className="btn btnGhost" onClick={() => setEditOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btnPrimary">Salvar</button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteOpen} title="Remover produto" onClose={() => setDeleteOpen(false)}>
        <div className="confirm">
          <div className="confirmText">Remover <strong>{current?.nome}</strong> do catálogo?</div>
          <div className="modalActions">
            <button className="btn btnGhost" onClick={() => setDeleteOpen(false)}>Cancelar</button>
            <button className="btn btnDanger" onClick={confirmDelete}>Remover</button>
          </div>
        </div>
      </Modal>

      <div className={`drawerOverlay ${drawerOpen ? "open" : ""}`} aria-hidden={!drawerOpen}>
        <button className="drawerBackdrop" onClick={() => setDrawerOpen(false)} aria-label="Fechar cadastro" />
        <div className="drawer card">
          <div className="drawerHead">
            <div>
              <div className="kicker">CADASTRO</div>
              <div className="drawerTitle display">NOVO PRODUTO</div>
            </div>
            <button className="iconBtn" onClick={() => setDrawerOpen(false)} aria-label="Fechar">×</button>
          </div>

          <form className="form formCompact" onSubmit={addProduto}>
            <div className="field">
              <label className="label" htmlFor="m_nome">Nome</label>
              <input
                id="m_nome"
                name="nome"
                className="input"
                value={form.nome}
                onChange={onChangeForm}
                placeholder="Ex: Headset Auralis"
                required
              />
            </div>

            <div className="row2">
              <div className="field">
                <label className="label" htmlFor="m_preco">Preço</label>
                <input
                  id="m_preco"
                  name="preco"
                  className="input"
                  value={form.preco}
                  onChange={onChangeForm}
                  placeholder="Ex: 599"
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="m_categoria">Categoria</label>
                <select
                  id="m_categoria"
                  name="categoria"
                  className="select"
                  value={form.categoria}
                  onChange={onChangeForm}
                >
                  <option>Áudio</option>
                  <option>Setup</option>
                  <option>Acessórios</option>
                  <option>Computação</option>
                  <option>Wearables</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="m_desc">Descrição</label>
              <textarea
                id="m_desc"
                name="descricao"
                className="textarea"
                value={form.descricao}
                onChange={onChangeForm}
                placeholder="Descrição curta e objetiva"
                required
                rows={3}
              />
            </div>

            <button className="btn btnPrimary btnBlock" type="submit">Adicionar produto</button>
            <div className="hint">Obrigatórios: nome, preço e descrição.</div>
          </form>
        </div>
      </div>
    </div>
  );
}
