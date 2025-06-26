export class EventoDTO {
    id_evento: number | null;
    nome_evento: string | null;
    descricao: string | null;
    data_criacao: Date | null;
    data_inicio: Date | null;
    data_fim: Date | null;
    estatus: number | null;
    foto: string | null;
    id_estabelecimento: number | null;
    id_endereco: number | null;
    Evento_Categoria: Array<{id_evento: number, id_categoria: number}>;
}