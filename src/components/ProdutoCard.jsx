export default function ProdutoCard({ produto, onEdit, onDelete }) {
  const { nome, precoFormatado, descricao, imagem, categoria } = produto;

  return (
    <article className="productCard">
      <div className="productMedia">
        <img className="productImg" src={imagem} alt={nome} />
        <span className="productTag">{categoria}</span>
      </div>

      <div className="productInfo">
        <div className="productTop">
          <h3 className="productName">{nome}</h3>
          <span className="productPrice">{precoFormatado}</span>
        </div>

        <p className="productDesc">{descricao}</p>

        <div className="productActions">
          <button className="btn btnGhost" onClick={() => onEdit(produto)}>Editar</button>
          <button className="btn btnDanger" onClick={() => onDelete(produto)}>Remover</button>
        </div>
      </div>
    </article>
  );
}
