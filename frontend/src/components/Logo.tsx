import ChessLogo from '../assets/ChessLogo.png';

/* Le logo porte déjà son propre texte : on ne lui accole jamais de
   wordmark, sinon deux noms cohabitent dans le même bloc.
   Le fond est transparent, mais une partie du lettrage est sombre — sur
   fond foncé il faut donc poser le logo sur une pastille claire
   (`onDark`), sans quoi la moitié du nom disparaît. */
export function Logo({
  className = 'h-11 w-auto',
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const image = (
    <img src={onDark ? ChessLogo : ChessLogo} alt="VIPP Digital Services" className={className} draggable={false} />
  );

  return image;
}
