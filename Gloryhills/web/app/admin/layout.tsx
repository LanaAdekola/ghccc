import './admin.css';
import type {Metadata} from 'next';
export const dynamic="force-dynamic";
export const metadata:Metadata={title:'Administration',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <div className="admin-area">{children}</div>;}
