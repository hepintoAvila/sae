import { useMemo } from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { useAulasContext } from '@/common/context/useAulasContext';

export default function OccupancyHeatmap({ filtroDep='all', desde='', hasta='' }:{filtroDep?:string,desde?:string,hasta?:string}) {
  const { prestamos = [] } = useAulasContext();

  const parseDate = (v:any) => new Date(String(v).trim().replace(' ','T'));
  const formatKey = (v:any) => parseDate(v).toISOString().split('T')[0];

  const data = useMemo(() => {
    const filtrados = prestamos.filter(p=>{
      const okDep = filtroDep==='all' || String(p.dependencia_id)===filtroDep;
      const f = formatKey(p.start);
      return okDep && (!desde||f>=desde) && (!hasta||f<=hasta);
    });

    // matriz 7 días x 14 horas (7am-21pm)
    const dias = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    const horas = [...Array(14)].map((_,i)=>7+i);
    const matrix = dias.map(()=> horas.map(()=>0));

    filtrados.forEach(p=>{
      const s = parseDate(p.start);
      const e = parseDate(p.end);
      const dia = (s.getDay()+6)%7; // lunes=0
      for(let h=s.getHours(); h<e.getHours(); h++){
        if(h>=7 && h<21) matrix[dia][h-7]++;
      }
    });
    return { dias, horas, matrix };
  }, [prestamos, filtroDep, desde, hasta]);

  const max = Math.max(...data.matrix.flat(),1);

  return (
    <Card className="shadow-sm mt-3">
      <Card.Header className="bg-white py-2 d-flex justify-content-between">
        <h6 className="mb-0">Ocupación por franja horaria</h6>
        <small className="text-muted">Más oscuro = más uso</small>
      </Card.Header>
      <Card.Body className="p-2" style={{overflowX:'auto'}}>
        <Table bordered size="sm" className="mb-0 text-center" style={{minWidth:700}}>
          <thead><tr><th style={{width:60}}>Hora</th>{data.dias.map(d=><th key={d}>{d}</th>)}</tr></thead>
          <tbody>
            {data.horas.map((h,i)=>(
              <tr key={h}>
                <td className="fw-bold">{h}:00</td>
                {data.dias.map((_,d)=>{
                  const v = data.matrix[d][i];
                  const intensity = Math.round((v/max)*100);
                  const bg = `rgba(13,110,253,${0.15+intensity/150})`;
                  return <td key={d} style={{background:bg}} title={`${v} préstamos`}>{v>0?<Badge bg={v>3?'danger':v>1?'warning':'primary'}>{v}</Badge>:''}</td>
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}