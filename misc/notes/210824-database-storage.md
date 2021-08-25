```sql
create table public.chatFullTexts (
	chatId uuid primary key,
	chatFullText json not null,
	chatTimestamp timestamp not null
);

alter table public.chatFullTexts enable row level security;

create table public.chats (
	userId uuid references auth.users not null,
	chatId uuid references chatFullTexts (chatId),
	chatName text not null,
	chatTimestamp timestamp references chatFullTexts (chatTimestamp),

	primary key (chatId)
);

alter table public.chats enable row level security;
```

## authCheck
check localStorage for { signedIn boolean, expiry }
look for refresh token
if not found, or if server says !200,
request new token via user signIn
store in cookies
update signedIn boolean, expiry
store in localStorage


store JWT in memory
(handled by supabase lib)

re-run authCheck before rendering:
+ chats
+ account settings

after JWT is received, update the expiry

## auto refresh token
fetch request, using cookie in headers
store response into refresh token cookie
store token as new token
3 minutes before expiry

