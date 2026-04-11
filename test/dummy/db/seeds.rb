users = [
  { name: "Alice Johnson", email: "alice@example.com" },
  { name: "Bob Smith", email: "bob@example.com" },
  { name: "Carol Williams", email: "carol@example.com" },
  { name: "David Brown", email: "david@example.com" },
  { name: "Eve Davis", email: "eve@example.com" },
  { name: "Frank Miller", email: "frank@example.com" },
  { name: "Grace Lee", email: "grace@example.com" },
  { name: "Henry Wilson", email: "henry@example.com" },
  { name: "Ivy Chen", email: "ivy@example.com" },
  { name: "Jack Taylor", email: "jack@example.com" },
  { name: "Karen White", email: "karen@example.com" },
  { name: "Leo Martinez", email: "leo@example.com" },
  { name: "Mia Anderson", email: "mia@example.com" },
  { name: "Noah Thomas", email: "noah@example.com" },
  { name: "Olivia Garcia", email: "olivia@example.com" },
  { name: "Paul Robinson", email: "paul@example.com" },
  { name: "Quinn Harris", email: "quinn@example.com" },
  { name: "Ruby Clark", email: "ruby@example.com" },
  { name: "Sam Lewis", email: "sam@example.com" },
  { name: "Tina Walker", email: "tina@example.com" },
  { name: "Uma Patel", email: "uma@example.com" },
  { name: "Victor Hall", email: "victor@example.com" },
  { name: "Wendy Young", email: "wendy@example.com" },
  { name: "Xavier King", email: "xavier@example.com" },
  { name: "Yara Scott", email: "yara@example.com" }
]

users.each do |attrs|
  User.find_or_create_by!(email: attrs[:email]) do |user|
    user.name = attrs[:name]
    user.password = SecureRandom.hex(12)
    user.confirmed_at = Time.current
  end
end

post_titles = [
  "Getting started with Rails",
  "Understanding Active Record",
  "Turbo Frames in practice",
  "Stimulus controllers",
  "Deploying to production",
  "Testing best practices",
  "Background jobs with Solid Queue",
  "Authentication with Devise",
  "Search with Ransack",
  "Pagination with Pagy",
  "CSS architecture patterns",
  "Importmap and modern JS"
]

all_users = User.all.to_a
post_titles.each_with_index do |title, i|
  Post.find_or_create_by!(title: title) do |post|
    post.body = "This is the body of \"#{title}\". It covers important concepts for Rails developers."
    post.user = all_users[i % all_users.size]
  end
end
