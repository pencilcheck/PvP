$player_a = {
  name: 'A',
  health: 10,
  moves: []
}

$player_b = {
  name: 'B',
  health: 10,
  moves: []
}

def damage(move_a, move_b)
  puts "Player #{$player_a[:name]} used #{move_a}, Player #{$player_b[:name]} used #{move_b}"
  if move_a == :volcano
    if move_b == :volcano
      return -2, -2
    elsif move_b == :water
      return 0, 0
    elsif move_b == :light
      return -1, -2
    elsif move_b == :magnetic
      chance = Random.new.rand(3)
      if chance == 0
        return -2, 0
      elsif chance == 1
        return 0, 0
      elsif chance == 2
        return 0, -2
      end
    end
  elsif move_a == :water
    if move_b == :volcano
      return 0, 0
    elsif move_b == :water
      return -1, -1
    elsif move_b == :light
      return -2, -1
    elsif move_b == :magnetic
      chance = Random.new.rand(3)
      if chance == 0
        return -2, 0
      elsif chance == 1
        return 0, 0
      elsif chance == 2
        return 0, -2
      end
    end
  elsif move_a == :light
    if move_b == :volcano
      return -2, -1
    elsif move_b == :water
      return -1, -2
    elsif move_b == :light
      chance = Random.new.rand(2)
      if chance == 0
        side = Random.new.rand(2)
        if side == 0
          return -3, 0
        elsif side == 1
          return 0, -3
        end
      elsif chance == 1
        return -2, -2
      end
    elsif move_b == :magnetic
      chance = Random.new.rand(3)
      if chance == 0
        return -2, 0
      elsif chance == 1
        return 0, 0
      elsif chance == 2
        return 0, -2
      end
    end
  elsif move_a == :magnetic
    if move_b == :volcano
      chance = Random.new.rand(3)
      if chance == 0
        return 0, -2
      elsif chance == 1
        return 0, 0
      elsif chance == 2
        return -2, 0
      end
    elsif move_b == :water
      chance = Random.new.rand(3)
      if chance == 0
        return 0, -2
      elsif chance == 1
        return 0, 0
      elsif chance == 2
        return -2, 0
      end
    elsif move_b == :light
      chance = Random.new.rand(3)
      if chance == 0
        return 0, -2
      elsif chance == 1
        return 0, 0
      elsif chance == 2
        return -2, 0
      end
    elsif move_b == :magnetic
      return 0, 0
    end
  end

  return 0, 0
end

while input = gets.chomp
  attack_a, attack_b = input.split
  damage_a, damage_b = damage(attack_a.to_sym, attack_b.to_sym)
  puts "Player #{$player_a[:name]} deals #{damage_b} damage to Player #{$player_b[:name]}"
  puts "Player #{$player_b[:name]} deals #{damage_a} damage to Player #{$player_a[:name]}"
  $player_a[:health] += damage_a
  $player_b[:health] += damage_b
  puts "Player #{$player_a[:name]} has #{$player_a[:health]}, Player #{$player_b[:name]} has #{$player_b[:health]}"
end
