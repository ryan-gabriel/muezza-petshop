import {
  Bath,
  Blocks,
  Boxes,
  Camera,
  ChartArea,
  ChevronUp,
  Group,
  Hotel,
  MessageSquareText,
  Store,
  Tags,
  User2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SignOutButton } from "./auth/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import ClientLinkButton from "./ui/ClientLinkButton";

const items = [
  { title: "Overview", url: "/dashboard", icon: ChartArea },
  { title: "Products", url: "/dashboard/products", icon: Boxes },
  { title: "Categories", url: "/dashboard/categories", icon: Group },
  { title: "Branches", url: "/dashboard/branches", icon: Store },
  { title: "Groomings", url: "/dashboard/groomings", icon: Bath },
  { title: "Addon Services", url: "/dashboard/addon-services", icon: Blocks },
  { title: "Pet Hotels", url: "/dashboard/hotels", icon: Hotel },
  { title: "Photoshoots", url: "/dashboard/photoshoots", icon: Camera },
  { title: "Discounts", url: "/dashboard/discounts", icon: Tags },
  { title: "Chatbot Config", url: "/dashboard/chatbot", icon: MessageSquareText },
];

export async function AppSidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const username =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest";

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <ClientLinkButton href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </ClientLinkButton>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  {username}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <SignOutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
