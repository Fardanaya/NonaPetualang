import { UserDropdown } from "../User";

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  collapsed?: boolean;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  collapsed,
  ...rest
}) => {
  return (
    <div {...rest}>
      <UserDropdown fullWidth={!collapsed} />
    </div>
  );
};
